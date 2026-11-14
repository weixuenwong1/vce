import logging

import stripe
from django.conf import settings
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Referral

from .access import has_subject_access
from .models import BillingCustomer, MembershipSubscription
from .referrals import (
    ReferralClaimError,
    claim_annual_referral,
    eligible_annual_referral,
    normalize_referral_code,
    payment_has_disqualifying_refund,
    referral_offer_eligibility,
)
from .services import (
    configured_price_id,
    ensure_billing_customer,
    object_value,
    sync_checkout_session,
    sync_subscription,
)


SUBJECTS = {choice[0] for choice in MembershipSubscription.SUBJECT_CHOICES}
PLANS = {choice[0] for choice in MembershipSubscription.PLAN_CHOICES}
BILLING_CYCLES = {choice[0] for choice in MembershipSubscription.BILLING_CHOICES}
logger = logging.getLogger(__name__)


def feature_unavailable_response(feature):
    return Response(
        {"detail": f"{feature} is not available yet."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


def checkout_enabled_for(user):
    if settings.BILLING_CHECKOUT_ENABLED:
        return True
    email = str(getattr(user, "email", "")).strip().lower()
    return bool(email and email in settings.BILLING_CHECKOUT_TEST_EMAILS)


def configure_stripe():
    stripe.api_key = settings.STRIPE_SECRET_KEY


def stripe_configuration_error():
    if not settings.STRIPE_SECRET_KEY:
        return "Stripe is not configured on this server."
    return None


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not checkout_enabled_for(request.user):
            return feature_unavailable_response("Checkout")

        configuration_error = stripe_configuration_error()
        if configuration_error:
            return Response({"detail": configuration_error}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        plan = request.data.get("plan")
        subject = request.data.get("subject")
        billing_cycle = request.data.get("billing_cycle")
        if plan not in PLANS or subject not in SUBJECTS or billing_cycle not in BILLING_CYCLES:
            return Response(
                {"detail": "Choose a valid plan, subject and billing option."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        price_id = configured_price_id(plan, billing_cycle)
        if not price_id:
            return Response(
                {"detail": "That billing option is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        existing = MembershipSubscription.objects.filter(
            user=request.user,
            subject=subject,
        ).filter(
            Q(
                billing_cycle=MembershipSubscription.BILLING_MONTHLY,
                status__in=MembershipSubscription.OPEN_STATUSES,
            )
            | Q(
                billing_cycle=MembershipSubscription.BILLING_ANNUAL,
                status__in=MembershipSubscription.ACCESS_STATUSES,
                current_period_end__gt=timezone.now(),
            )
        ).first()
        if existing:
            return Response(
                {"detail": "You already have a subscription for this subject."},
                status=status.HTTP_409_CONFLICT,
            )

        referral = None
        referral_coupon_id = ""
        referral_discount_amount = 0
        referral_code = normalize_referral_code(request.data.get("referral_code", ""))
        if referral_code and not settings.REFERRALS_ENABLED:
            return feature_unavailable_response("The referral discount")

        if (
            settings.REFERRALS_ENABLED
            and billing_cycle == MembershipSubscription.BILLING_ANNUAL
        ):
            try:
                referral = claim_annual_referral(
                    request.user,
                    referral_code,
                )
            except ReferralClaimError as error:
                return Response(
                    {"detail": str(error)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if referral:
                referral_coupon_id = settings.STRIPE_REFERRAL_COUPON_IDS.get(plan, "")
                referral_discount_amount = int(
                    settings.STRIPE_REFERRAL_AMOUNTS.get(plan, 0) or 0
                )
                if not referral_coupon_id or referral_discount_amount <= 0:
                    return Response(
                        {"detail": "Your referral discount is not configured yet. Please contact Chuba."},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )

        configure_stripe()
        billing_customer = BillingCustomer.objects.filter(user=request.user).first()
        try:
            if billing_customer:
                customer_id = billing_customer.stripe_customer_id
            else:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    metadata={"chuba_user_id": str(request.user.pk)},
                )
                customer_id = customer.id
                ensure_billing_customer(request.user, customer_id)

            metadata = {
                "user_id": str(request.user.pk),
                "plan": plan,
                "subject": subject,
                "billing_cycle": billing_cycle,
                "price_id": price_id,
            }
            if referral:
                metadata.update({
                    "referral_id": str(referral.pk),
                    "referral_discount_amount": str(referral_discount_amount),
                })
            frontend_url = settings.STRIPE_FRONTEND_URL.rstrip("/")
            checkout_options = {
                "mode": (
                    "payment"
                    if billing_cycle == MembershipSubscription.BILLING_ANNUAL
                    else "subscription"
                ),
                "customer": customer_id,
                "client_reference_id": str(request.user.pk),
                "line_items": [{"price": price_id, "quantity": 1}],
                "metadata": metadata,
                "success_url": (
                    f"{frontend_url}/checkout/success"
                    "?session_id={CHECKOUT_SESSION_ID}"
                ),
                "cancel_url": f"{frontend_url}/choose-plan/{plan}",
            }
            if referral_coupon_id:
                checkout_options["discounts"] = [{"coupon": referral_coupon_id}]
            if billing_cycle == MembershipSubscription.BILLING_ANNUAL:
                checkout_options["payment_intent_data"] = {"metadata": metadata}
            else:
                checkout_options["subscription_data"] = {"metadata": metadata}
            checkout = stripe.checkout.Session.create(**checkout_options)
        except stripe.StripeError as error:
            logger.exception("Stripe checkout session creation failed")
            detail = "Stripe could not start checkout. Please try again."
            if settings.DEBUG and getattr(error, "user_message", None):
                detail = error.user_message
            return Response(
                {"detail": detail},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"checkout_url": checkout.url})


class ReferralOfferView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not settings.REFERRALS_ENABLED:
            return Response({"valid": False, "eligible": False})

        code = normalize_referral_code(request.query_params.get("code", ""))
        if not code and request.user.is_authenticated:
            referral = eligible_annual_referral(request.user)
            code = referral.code_used if referral else ""
        if not code:
            return Response({"valid": False, "eligible": False})

        eligible, message = referral_offer_eligibility(request.user, code)
        return Response({
            "valid": message != "This referral link is not valid.",
            "eligible": eligible,
            "code": code if eligible else "",
            "message": message,
            "discounts": {
                plan: int(amount or 0) / 100
                for plan, amount in settings.STRIPE_REFERRAL_AMOUNTS.items()
            } if eligible else {},
        })


class SubjectAccessView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, subject):
        normalized_subject = str(subject).strip().lower()
        if normalized_subject not in SUBJECTS:
            return Response(
                {"detail": "Choose a valid subject."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "subject": normalized_subject,
            "has_access": has_subject_access(request.user, normalized_subject),
        })


class CheckoutSessionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get("session_id", "")
        if not session_id or stripe_configuration_error():
            return Response({"detail": "Checkout session is unavailable."}, status=400)

        configure_stripe()
        try:
            checkout = stripe.checkout.Session.retrieve(session_id)
        except stripe.StripeError:
            return Response({"detail": "Checkout session could not be verified."}, status=400)

        owner_id = object_value(checkout, "client_reference_id")
        if str(owner_id) != str(request.user.pk):
            return Response({"detail": "Checkout session not found."}, status=404)

        membership = sync_checkout_session(checkout)
        payment_status = object_value(checkout, "payment_status")
        if membership and membership.has_access:
            state = "active"
        elif object_value(checkout, "status") == "complete":
            state = "processing"
        else:
            state = "incomplete"

        conversion = None
        amount_total = object_value(checkout, "amount_total")
        currency = object_value(checkout, "currency")
        if (
            state == "active"
            and payment_status in {"paid", "no_payment_required"}
            and amount_total is not None
            and currency
        ):
            conversion = {
                "transaction_id": session_id,
                "value": amount_total / 100,
                "currency": str(currency).upper(),
            }

        return Response({
            "status": state,
            "plan": membership.plan if membership else None,
            "subject": membership.subject if membership else None,
            "conversion": conversion,
        })


class CustomerPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if stripe_configuration_error():
            return Response({"detail": "Stripe is not configured on this server."}, status=503)

        customer = BillingCustomer.objects.filter(user=request.user).first()
        if not customer:
            return Response({"detail": "No billing account was found."}, status=404)

        configure_stripe()
        try:
            portal = stripe.billing_portal.Session.create(
                customer=customer.stripe_customer_id,
                return_url=f"{settings.STRIPE_FRONTEND_URL.rstrip('/')}/go-pro",
            )
        except stripe.StripeError:
            return Response({"detail": "The billing portal is unavailable."}, status=502)
        return Response({"portal_url": portal.url})


def subscription_id_from_invoice(invoice):
    subscription_id = object_value(invoice, "subscription")
    if subscription_id:
        return subscription_id
    parent = object_value(invoice, "parent", {})
    details = object_value(parent, "subscription_details", {})
    return object_value(details, "subscription")


@csrf_exempt
def stripe_webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)
    if not settings.STRIPE_WEBHOOK_SECRET:
        return JsonResponse({"detail": "Webhook is not configured."}, status=503)

    configure_stripe()
    try:
        event = stripe.Webhook.construct_event(
            request.body,
            request.headers.get("Stripe-Signature", ""),
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.SignatureVerificationError):
        return HttpResponse(status=400)

    event_type = object_value(event, "type", "")
    event_object = object_value(object_value(event, "data", {}), "object", {})
    if event_type in {
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
    }:
        sync_checkout_session(event_object)
    elif event_type in {
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "customer.subscription.paused",
        "customer.subscription.resumed",
    }:
        sync_subscription(event_object)
    elif event_type == "invoice.payment_failed":
        subscription_id = subscription_id_from_invoice(event_object)
        if subscription_id:
            MembershipSubscription.objects.filter(
                stripe_subscription_id=subscription_id
            ).update(status="past_due")
    elif event_type == "invoice.paid":
        subscription_id = subscription_id_from_invoice(event_object)
        if subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(subscription_id)
            except stripe.StripeError:
                return HttpResponse(status=500)
            sync_subscription(subscription)
    elif event_type == "charge.refunded":
        amount = int(object_value(event_object, "amount", 0) or 0)
        amount_refunded = int(object_value(event_object, "amount_refunded", 0) or 0)
        payment_intent_id = object_value(event_object, "payment_intent")
        if payment_intent_id and amount > 0 and amount_refunded >= amount:
            try:
                has_disqualifying_refund = payment_has_disqualifying_refund(
                    payment_intent_id
                )
            except stripe.StripeError:
                return HttpResponse(status=500)
            if not has_disqualifying_refund:
                return HttpResponse(status=200)
            memberships = MembershipSubscription.objects.filter(
                stripe_payment_intent_id=payment_intent_id
            )
            memberships.update(status="refunded")
            Referral.objects.filter(
                qualifying_membership__in=memberships,
                status__in=(Referral.STATUS_REGISTERED, Referral.STATUS_QUALIFIED),
            ).update(
                status=Referral.STATUS_DISQUALIFIED,
                reward_error="The qualifying purchase was fully refunded.",
            )

    return HttpResponse(status=200)
