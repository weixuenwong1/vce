from datetime import datetime, timezone as datetime_timezone

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import BillingCustomer, MembershipSubscription
from .referrals import record_annual_referral_purchase


def configured_price_id(plan, billing_cycle):
    return settings.STRIPE_PRICE_IDS.get(plan, {}).get(billing_cycle, "")


def selection_for_price(price_id):
    for plan, cycles in settings.STRIPE_PRICE_IDS.items():
        for billing_cycle, configured_id in cycles.items():
            if configured_id and configured_id == price_id:
                return plan, billing_cycle
    return None, None


def object_value(value, key, default=None):
    if value is None:
        return default
    if isinstance(value, dict):
        return value.get(key, default)
    return getattr(value, key, default)


def first_subscription_item(subscription):
    items = object_value(subscription, "items", {})
    data = object_value(items, "data", []) or []
    return data[0] if data else None


def period_end_from_subscription(subscription):
    timestamp = object_value(subscription, "current_period_end")
    if not timestamp:
        timestamp = object_value(first_subscription_item(subscription), "current_period_end")
    if not timestamp:
        return None
    return datetime.fromtimestamp(timestamp, tz=datetime_timezone.utc)


def one_year_from(value):
    """Return the same calendar date next year, including a safe leap-day fallback."""
    try:
        return value.replace(year=value.year + 1)
    except ValueError:
        return value.replace(year=value.year + 1, day=28)


def price_id_from_subscription(subscription):
    price = object_value(first_subscription_item(subscription), "price", {})
    return object_value(price, "id", "")


def user_from_metadata(metadata):
    user_id = object_value(metadata, "user_id")
    if not user_id:
        return None
    return get_user_model().objects.filter(pk=user_id).first()


def ensure_billing_customer(user, stripe_customer_id):
    if not stripe_customer_id:
        return None
    customer, _ = BillingCustomer.objects.update_or_create(
        user=user,
        defaults={"stripe_customer_id": stripe_customer_id},
    )
    return customer


def sync_subscription(subscription):
    subscription_id = object_value(subscription, "id")
    if not subscription_id:
        return None

    existing = MembershipSubscription.objects.filter(
        stripe_subscription_id=subscription_id
    ).select_related("user").first()
    customer_id = object_value(subscription, "customer") or (
        existing.stripe_customer_id if existing else None
    )
    metadata = object_value(subscription, "metadata", {})
    price_id = price_id_from_subscription(subscription) or (
        existing.stripe_price_id if existing else ""
    )
    plan = object_value(metadata, "plan") or (existing.plan if existing else None)
    billing_cycle = object_value(metadata, "billing_cycle") or (
        existing.billing_cycle if existing else None
    )
    if not plan or not billing_cycle:
        plan, billing_cycle = selection_for_price(price_id)

    user = user_from_metadata(metadata)
    if not user and customer_id:
        customer = BillingCustomer.objects.select_related("user").filter(
            stripe_customer_id=customer_id
        ).first()
        user = customer.user if customer else None
    if not user and existing:
        user = existing.user

    subject = object_value(metadata, "subject") or (
        existing.subject if existing else None
    )
    if not all((subscription_id, customer_id, user, plan, subject, billing_cycle, price_id)):
        return None

    current_period_end = period_end_from_subscription(subscription)
    if current_period_end is None and existing:
        current_period_end = existing.current_period_end

    ensure_billing_customer(user, customer_id)
    membership, _ = MembershipSubscription.objects.update_or_create(
        stripe_subscription_id=subscription_id,
        defaults={
            "user": user,
            "stripe_customer_id": customer_id,
            "stripe_price_id": price_id,
            "plan": plan,
            "subject": subject,
            "billing_cycle": billing_cycle,
            "status": object_value(subscription, "status", "incomplete"),
            "current_period_end": current_period_end,
            "cancel_at_period_end": bool(
                object_value(subscription, "cancel_at_period_end", False)
                or object_value(subscription, "cancel_at")
            ),
        },
    )
    return membership


def sync_checkout_session(session):
    metadata = object_value(session, "metadata", {})
    user = user_from_metadata(metadata)
    customer_id = object_value(session, "customer")
    checkout_session_id = object_value(session, "id", "")
    subscription_id = object_value(session, "subscription")
    payment_intent_id = object_value(session, "payment_intent")
    plan = object_value(metadata, "plan")
    subject = object_value(metadata, "subject")
    billing_cycle = object_value(metadata, "billing_cycle")
    price_id = object_value(metadata, "price_id") or configured_price_id(plan, billing_cycle)

    if not all((user, customer_id, checkout_session_id, plan, subject, billing_cycle, price_id)):
        return None

    ensure_billing_customer(user, customer_id)

    if billing_cycle == MembershipSubscription.BILLING_ANNUAL:
        membership = MembershipSubscription.objects.filter(
            stripe_checkout_session_id=checkout_session_id
        ).first()
        payment_is_complete = object_value(session, "payment_status") in {
            "paid",
            "no_payment_required",
        }
        if membership and membership.current_period_end:
            access_expires_at = membership.current_period_end
        elif payment_is_complete:
            access_expires_at = one_year_from(timezone.now())
        else:
            access_expires_at = None

        defaults = {
            "user": user,
            "stripe_customer_id": customer_id,
            "stripe_subscription_id": None,
            "stripe_payment_intent_id": payment_intent_id or None,
            "stripe_price_id": price_id,
            "plan": plan,
            "subject": subject,
            "billing_cycle": billing_cycle,
            "status": "active" if payment_is_complete else "incomplete",
            "current_period_end": access_expires_at,
            "cancel_at_period_end": False,
        }
        if membership:
            for field, value in defaults.items():
                setattr(membership, field, value)
            membership.save(update_fields=(*defaults.keys(), "updated_at"))
            record_annual_referral_purchase(
                membership,
                object_value(metadata, "referral_id"),
                object_value(metadata, "referral_discount_amount", 0),
            )
            return membership
        membership = MembershipSubscription.objects.create(
            stripe_checkout_session_id=checkout_session_id,
            **defaults,
        )
        record_annual_referral_purchase(
            membership,
            object_value(metadata, "referral_id"),
            object_value(metadata, "referral_discount_amount", 0),
        )
        return membership

    if not subscription_id:
        return None

    membership, _ = MembershipSubscription.objects.update_or_create(
        stripe_subscription_id=subscription_id,
        defaults={
            "user": user,
            "stripe_customer_id": customer_id,
            "stripe_checkout_session_id": checkout_session_id,
            "stripe_payment_intent_id": None,
            "stripe_price_id": price_id,
            "plan": plan,
            "subject": subject,
            "billing_cycle": billing_cycle,
            "status": "active" if object_value(session, "payment_status") == "paid" else "incomplete",
        },
    )
    return membership
