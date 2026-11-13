from datetime import timedelta

import stripe
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from accounts.emails import send_referral_reward_email
from accounts.models import Referral
from accounts.models import ReferralCode

from .models import MembershipSubscription


def object_value(value, key, default=None):
    if value is None:
        return default
    if isinstance(value, dict):
        return value.get(key, default)
    return getattr(value, key, default)


def eligible_annual_referral(user):
    return (
        Referral.objects.filter(
            referred_user=user,
            status=Referral.STATUS_REGISTERED,
            qualifying_membership__isnull=True,
        )
        .select_related("referrer")
        .first()
    )


class ReferralClaimError(ValueError):
    pass


def normalize_referral_code(value):
    return str(value or "").strip().upper()


def referral_offer_eligibility(user, code):
    normalized_code = normalize_referral_code(code)
    referral_code = (
        ReferralCode.objects.select_related("user")
        .filter(code__iexact=normalized_code)
        .first()
    )
    if not referral_code:
        return False, "This referral link is not valid."

    if not getattr(user, "is_authenticated", False):
        return True, ""
    if referral_code.user_id == user.pk:
        return False, "You cannot use your own referral link."

    existing_referral = Referral.objects.filter(referred_user=user).first()
    if existing_referral:
        if (
            existing_referral.referrer_id == referral_code.user_id
            and existing_referral.status == Referral.STATUS_REGISTERED
            and not existing_referral.qualifying_membership_id
        ):
            return True, ""
        return False, "A different referral is already attached to this account."

    if MembershipSubscription.objects.filter(user=user).exists():
        return False, "Referral offers are available to new Chuba customers only."
    return True, ""


@transaction.atomic
def claim_annual_referral(user, code):
    normalized_code = normalize_referral_code(code)
    existing_referral = (
        Referral.objects.select_for_update()
        .filter(referred_user=user)
        .first()
    )
    if not normalized_code:
        return existing_referral if (
            existing_referral
            and existing_referral.status == Referral.STATUS_REGISTERED
            and not existing_referral.qualifying_membership_id
        ) else None

    eligible, message = referral_offer_eligibility(user, normalized_code)
    if not eligible:
        raise ReferralClaimError(message)
    if existing_referral:
        return existing_referral

    referral_code = ReferralCode.objects.select_related("user").get(
        code__iexact=normalized_code
    )
    return Referral.objects.create(
        referrer=referral_code.user,
        referred_user=user,
        code_used=referral_code.code,
    )


@transaction.atomic
def record_annual_referral_purchase(membership, referral_id, discount_amount):
    if (
        not referral_id
        or membership.billing_cycle != MembershipSubscription.BILLING_ANNUAL
        or not membership.has_access
    ):
        return None

    referral = (
        Referral.objects.select_for_update()
        .filter(
            pk=referral_id,
            referred_user=membership.user,
            status=Referral.STATUS_REGISTERED,
        )
        .first()
    )
    if not referral:
        return None
    if referral.qualifying_membership_id:
        return referral

    referral.qualifying_membership = membership
    referral.reward_due_at = timezone.now() + timedelta(days=30)
    referral.friend_discount_amount = max(int(discount_amount or 0), 0)
    referral.reward_error = ""
    referral.save(
        update_fields=(
            "qualifying_membership",
            "reward_due_at",
            "friend_discount_amount",
            "reward_error",
        )
    )
    return referral


def charge_from_payment_intent(payment_intent):
    return object_value(payment_intent, "latest_charge")


def charge_is_settled(charge):
    if not charge:
        return False
    amount = int(object_value(charge, "amount", 0) or 0)
    return (
        amount > 0
        and not bool(object_value(charge, "disputed", False))
    )


def refund_is_referral_reward(refund):
    metadata = object_value(refund, "metadata", {}) or {}
    return bool(object_value(metadata, "chuba_referral_id"))


def payment_has_disqualifying_refund(payment_intent_id):
    refunds = stripe.Refund.list(payment_intent=payment_intent_id, limit=100)
    data = object_value(refunds, "data", []) or []
    return any(
        int(object_value(refund, "amount", 0) or 0) > 0
        and object_value(refund, "status") not in {"failed", "canceled"}
        and not refund_is_referral_reward(refund)
        for refund in data
    )


def refundable_amount(charge):
    amount = int(object_value(charge, "amount", 0) or 0)
    amount_refunded = int(object_value(charge, "amount_refunded", 0) or 0)
    return max(amount - amount_refunded, 0)


def active_referrer_membership(referral):
    return (
        MembershipSubscription.objects.filter(
            user=referral.referrer,
            billing_cycle=MembershipSubscription.BILLING_ANNUAL,
            status__in=MembershipSubscription.ACCESS_STATUSES,
            current_period_end__gt=timezone.now(),
            stripe_payment_intent_id__isnull=False,
        )
        .exclude(stripe_payment_intent_id="")
        .order_by("-created_at")
        .first()
    )


def reward_amount_for_membership(membership):
    return int(settings.STRIPE_REFERRAL_AMOUNTS.get(membership.plan, 0) or 0)


def mark_reward_error(referral, message, *, disqualify=False):
    referral.last_reward_attempt_at = timezone.now()
    referral.reward_error = message
    fields = ["last_reward_attempt_at", "reward_error"]
    if disqualify:
        referral.status = Referral.STATUS_DISQUALIFIED
        fields.append("status")
    referral.save(update_fields=fields)


def process_resource_referral(referral):
    if referral.status == Referral.STATUS_REWARDED:
        return "already_rewarded"
    if not referral.qualifying_membership_id or not referral.reward_due_at:
        return "not_ready"
    if referral.reward_due_at > timezone.now():
        return "not_due"

    membership = referral.qualifying_membership
    if (
        membership.billing_cycle != MembershipSubscription.BILLING_ANNUAL
        or not membership.has_access
        or not membership.stripe_payment_intent_id
    ):
        mark_reward_error(referral, "The referred annual purchase is no longer active.", disqualify=True)
        return "disqualified"

    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        referred_payment = stripe.PaymentIntent.retrieve(
            membership.stripe_payment_intent_id,
            expand=["latest_charge"],
        )
    except stripe.StripeError as error:
        mark_reward_error(referral, f"Could not verify referred payment: {error}")
        return "retry"

    referred_charge = charge_from_payment_intent(referred_payment)
    if object_value(referred_payment, "status") != "succeeded" or not charge_is_settled(
        referred_charge
    ):
        mark_reward_error(referral, "The referred payment was refunded, disputed or not completed.", disqualify=True)
        return "disqualified"
    if int(object_value(referred_charge, "amount_refunded", 0) or 0) > 0:
        try:
            has_disqualifying_refund = payment_has_disqualifying_refund(
                membership.stripe_payment_intent_id
            )
        except stripe.StripeError as error:
            mark_reward_error(referral, f"Could not verify referred refunds: {error}")
            return "retry"
        if has_disqualifying_refund:
            mark_reward_error(referral, "The referred payment received a non-referral refund.", disqualify=True)
            return "disqualified"

    referrer_membership = active_referrer_membership(referral)
    if not referrer_membership:
        mark_reward_error(referral, "The referrer does not have active 12-month access.", disqualify=True)
        return "disqualified"

    reward_amount = reward_amount_for_membership(referrer_membership)
    if reward_amount <= 0:
        mark_reward_error(referral, "The referrer's plan has no configured reward amount.")
        return "retry"

    try:
        referrer_payment = stripe.PaymentIntent.retrieve(
            referrer_membership.stripe_payment_intent_id,
            expand=["latest_charge"],
        )
    except stripe.StripeError as error:
        mark_reward_error(referral, f"Could not verify referrer payment: {error}")
        return "retry"

    if refundable_amount(charge_from_payment_intent(referrer_payment)) < reward_amount:
        mark_reward_error(referral, "The referrer's payment does not have enough refundable value.", disqualify=True)
        return "disqualified"

    try:
        refund = stripe.Refund.create(
            payment_intent=referrer_membership.stripe_payment_intent_id,
            amount=reward_amount,
            metadata={
                "chuba_referral_id": str(referral.pk),
                "referred_user_id": str(referral.referred_user_id),
                "referrer_user_id": str(referral.referrer_id),
            },
            idempotency_key=f"chuba-referral-{referral.pk}-resource-refund",
        )
    except stripe.StripeError as error:
        mark_reward_error(referral, f"Stripe refund failed: {error}")
        return "retry"

    referral.status = Referral.STATUS_REWARDED
    referral.referrer_reward_amount = reward_amount
    referral.stripe_refund_id = object_value(refund, "id")
    referral.rewarded_at = timezone.now()
    referral.last_reward_attempt_at = referral.rewarded_at
    referral.reward_error = ""
    referral.save(
        update_fields=(
            "status",
            "referrer_reward_amount",
            "stripe_refund_id",
            "rewarded_at",
            "last_reward_attempt_at",
            "reward_error",
        )
    )
    send_referral_reward_email(referral)
    return "rewarded"


def process_due_resource_referrals():
    results = {
        "rewarded": 0,
        "disqualified": 0,
        "retry": 0,
        "skipped": 0,
    }
    referrals = Referral.objects.filter(
        status=Referral.STATUS_REGISTERED,
        reward_due_at__isnull=False,
        reward_due_at__lte=timezone.now(),
    ).select_related("referrer", "referred_user", "qualifying_membership")
    for referral in referrals.iterator():
        outcome = process_resource_referral(referral)
        if outcome in results:
            results[outcome] += 1
        else:
            results["skipped"] += 1
    return results
