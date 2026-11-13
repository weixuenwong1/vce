from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import CustomUser, Referral

from .models import BillingCustomer, MembershipSubscription
from .access import has_subject_access
from .referrals import process_resource_referral


TEST_PRICES = {
    "self-study": {"monthly": "price_self_month", "annual": "price_self_year"},
    "supported": {"monthly": "price_supported_month", "annual": "price_supported_year"},
}


@override_settings(
    BILLING_CHECKOUT_ENABLED=True,
    PAID_ACCESS_ENFORCEMENT_ENABLED=True,
    REFERRALS_ENABLED=True,
    STRIPE_SECRET_KEY="sk_test_example",
    STRIPE_WEBHOOK_SECRET="whsec_example",
    STRIPE_FRONTEND_URL="http://127.0.0.1:5173",
    STRIPE_PRICE_IDS=TEST_PRICES,
    STRIPE_REFERRAL_COUPON_IDS={
        "self-study": "coupon_ref_self",
        "supported": "coupon_ref_supported",
    },
    STRIPE_REFERRAL_AMOUNTS={"self-study": 1900, "supported": 3500},
)
class BillingApiTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="student@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(self.user)

    def create_monthly_membership(self, **overrides):
        values = {
            "user": self.user,
            "stripe_customer_id": "cus_monthly",
            "stripe_subscription_id": "sub_monthly",
            "stripe_price_id": "price_self_month",
            "plan": MembershipSubscription.PLAN_SELF_STUDY,
            "subject": MembershipSubscription.SUBJECT_PHYSICS,
            "billing_cycle": MembershipSubscription.BILLING_MONTHLY,
            "status": "active",
            "current_period_end": timezone.now() + timedelta(days=20),
        }
        values.update(overrides)
        return MembershipSubscription.objects.create(**values)

    @override_settings(BILLING_CHECKOUT_ENABLED=False)
    @patch("billing.views.stripe.checkout.Session.create")
    def test_checkout_feature_switch_blocks_stripe_calls(self, create_session):
        response = self.client.post(
            reverse("billing-checkout"),
            {"plan": "self-study", "subject": "physics", "billing_cycle": "monthly"},
            format="json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["detail"], "Checkout is not available yet.")
        create_session.assert_not_called()

    @override_settings(REFERRALS_ENABLED=False)
    def test_referral_feature_switch_hides_offers(self):
        response = self.client.get(
            reverse("billing-referral-offer"),
            {"code": "ANY-CODE"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"valid": False, "eligible": False})

    @override_settings(REFERRALS_ENABLED=False)
    @patch("billing.views.stripe.checkout.Session.create")
    def test_disabled_referrals_cannot_be_applied_to_checkout(self, create_session):
        response = self.client.post(
            reverse("billing-checkout"),
            {
                "plan": "self-study",
                "subject": "physics",
                "billing_cycle": "annual",
                "referral_code": "ANY-CODE",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.data["detail"],
            "The referral discount is not available yet.",
        )
        create_session.assert_not_called()

    @override_settings(PAID_ACCESS_ENFORCEMENT_ENABLED=False)
    def test_disabled_paid_access_gate_preserves_signed_in_access(self):
        self.assertTrue(has_subject_access(self.user, "physics"))

    @override_settings(REFERRALS_ENABLED=False)
    def test_disabled_referrals_block_reward_processing_command(self):
        with self.assertRaisesMessage(CommandError, "Referral rewards are disabled."):
            call_command("process_referral_rewards")

    @patch("billing.views.stripe.checkout.Session.create")
    @patch("billing.views.stripe.Customer.create")
    def test_monthly_checkout_uses_subscription_mode_and_server_side_price(self, create_customer, create_session):
        create_customer.return_value = SimpleNamespace(id="cus_test")
        create_session.return_value = SimpleNamespace(url="https://checkout.stripe.test/session")

        response = self.client.post(
            reverse("billing-checkout"),
            {"plan": "self-study", "subject": "physics", "billing_cycle": "monthly"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["checkout_url"], "https://checkout.stripe.test/session")
        kwargs = create_session.call_args.kwargs
        self.assertEqual(kwargs["line_items"], [{"price": "price_self_month", "quantity": 1}])
        self.assertEqual(kwargs["mode"], "subscription")
        self.assertIn("subscription_data", kwargs)
        self.assertNotIn("payment_intent_data", kwargs)
        self.assertEqual(kwargs["metadata"]["user_id"], str(self.user.pk))
        self.assertEqual(kwargs["metadata"]["subject"], "physics")
        self.assertTrue(BillingCustomer.objects.filter(user=self.user).exists())

    @patch("billing.views.stripe.checkout.Session.create")
    @patch("billing.views.stripe.Customer.create")
    def test_annual_checkout_uses_one_time_payment_mode(self, create_customer, create_session):
        create_customer.return_value = SimpleNamespace(id="cus_annual")
        create_session.return_value = SimpleNamespace(url="https://checkout.stripe.test/annual")

        response = self.client.post(
            reverse("billing-checkout"),
            {"plan": "self-study", "subject": "physics", "billing_cycle": "annual"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        kwargs = create_session.call_args.kwargs
        self.assertEqual(kwargs["mode"], "payment")
        self.assertEqual(kwargs["line_items"], [{"price": "price_self_year", "quantity": 1}])
        self.assertIn("payment_intent_data", kwargs)
        self.assertNotIn("subscription_data", kwargs)

    @patch("billing.views.stripe.checkout.Session.create")
    @patch("billing.views.stripe.Customer.create")
    def test_referred_annual_checkout_applies_plan_coupon(self, create_customer, create_session):
        referrer = CustomUser.objects.create_user(
            email="referrer@example.com",
            password="test-password",
            school="Test School",
        )
        referral = Referral.objects.create(
            referrer=referrer,
            referred_user=self.user,
            code_used=referrer.referral_code.code,
        )
        create_customer.return_value = SimpleNamespace(id="cus_referred")
        create_session.return_value = SimpleNamespace(url="https://checkout.stripe.test/referred")

        response = self.client.post(
            reverse("billing-checkout"),
            {"plan": "supported", "subject": "biology", "billing_cycle": "annual"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        kwargs = create_session.call_args.kwargs
        self.assertEqual(kwargs["discounts"], [{"coupon": "coupon_ref_supported"}])
        self.assertEqual(kwargs["metadata"]["referral_id"], str(referral.pk))
        self.assertEqual(kwargs["metadata"]["referral_discount_amount"], "3500")
        self.assertEqual(
            kwargs["payment_intent_data"]["metadata"]["referral_id"],
            str(referral.pk),
        )

    def test_referral_offer_is_visible_before_sign_in(self):
        referrer = CustomUser.objects.create_user(
            email="offer-referrer@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=None)

        response = self.client.get(
            reverse("billing-referral-offer"),
            {"code": referrer.referral_code.code.lower()},
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["valid"])
        self.assertTrue(response.data["eligible"])
        self.assertEqual(response.data["discounts"]["self-study"], 19)
        self.assertEqual(response.data["discounts"]["supported"], 35)

    @patch("billing.views.stripe.checkout.Session.create")
    @patch("billing.views.stripe.Customer.create")
    def test_logged_in_free_user_claims_referral_during_checkout(self, create_customer, create_session):
        referrer = CustomUser.objects.create_user(
            email="claim-referrer@example.com",
            password="test-password",
            school="Test School",
        )
        create_customer.return_value = SimpleNamespace(id="cus_claimed")
        create_session.return_value = SimpleNamespace(url="https://checkout.stripe.test/claimed")

        response = self.client.post(
            reverse("billing-checkout"),
            {
                "plan": "self-study",
                "subject": "physics",
                "billing_cycle": "annual",
                "referral_code": referrer.referral_code.code,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        referral = Referral.objects.get(referred_user=self.user)
        self.assertEqual(referral.referrer, referrer)
        self.assertEqual(
            create_session.call_args.kwargs["discounts"],
            [{"coupon": "coupon_ref_self"}],
        )

    def test_user_cannot_claim_their_own_referral_offer(self):
        response = self.client.get(
            reverse("billing-referral-offer"),
            {"code": self.user.referral_code.code},
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["valid"])
        self.assertFalse(response.data["eligible"])
        self.assertIn("own referral", response.data["message"])

    @patch("billing.views.stripe.checkout.Session.create")
    @patch("billing.views.stripe.Customer.create")
    def test_referred_monthly_checkout_does_not_apply_coupon(self, create_customer, create_session):
        referrer = CustomUser.objects.create_user(
            email="monthly-referrer@example.com",
            password="test-password",
            school="Test School",
        )
        Referral.objects.create(
            referrer=referrer,
            referred_user=self.user,
            code_used=referrer.referral_code.code,
        )
        create_customer.return_value = SimpleNamespace(id="cus_referred_monthly")
        create_session.return_value = SimpleNamespace(url="https://checkout.stripe.test/monthly")

        response = self.client.post(
            reverse("billing-checkout"),
            {"plan": "self-study", "subject": "physics", "billing_cycle": "monthly"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("discounts", create_session.call_args.kwargs)

    def test_checkout_rejects_unknown_plan(self):
        response = self.client.post(
            reverse("billing-checkout"),
            {"plan": "invented", "subject": "physics", "billing_cycle": "monthly"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    @patch("billing.views.stripe.checkout.Session.retrieve")
    def test_checkout_status_returns_verified_purchase_conversion(self, retrieve_session):
        retrieve_session.return_value = {
            "id": "cs_paid",
            "client_reference_id": str(self.user.pk),
            "customer": "cus_paid",
            "subscription": "sub_paid",
            "payment_status": "paid",
            "status": "complete",
            "amount_total": 1900,
            "currency": "aud",
            "metadata": {
                "user_id": str(self.user.pk),
                "plan": "self-study",
                "subject": "physics",
                "billing_cycle": "monthly",
                "price_id": "price_self_month",
            },
        }

        response = self.client.get(
            reverse("billing-checkout-status"),
            {"session_id": "cs_paid"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "active")
        self.assertEqual(response.data["conversion"], {
            "transaction_id": "cs_paid",
            "value": 19.0,
            "currency": "AUD",
        })

    @patch("billing.views.stripe.checkout.Session.retrieve")
    def test_checkout_status_omits_conversion_until_payment_is_complete(self, retrieve_session):
        retrieve_session.return_value = {
            "id": "cs_open",
            "client_reference_id": str(self.user.pk),
            "customer": "cus_open",
            "subscription": "sub_open",
            "payment_status": "unpaid",
            "status": "open",
            "amount_total": 1900,
            "currency": "aud",
            "metadata": {
                "user_id": str(self.user.pk),
                "plan": "self-study",
                "subject": "physics",
                "billing_cycle": "monthly",
                "price_id": "price_self_month",
            },
        }

        response = self.client.get(
            reverse("billing-checkout-status"),
            {"session_id": "cs_open"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "incomplete")
        self.assertIsNone(response.data["conversion"])

    @patch("billing.views.stripe.billing_portal.Session.create")
    def test_portal_is_created_for_existing_customer(self, create_portal):
        BillingCustomer.objects.create(user=self.user, stripe_customer_id="cus_test")
        create_portal.return_value = SimpleNamespace(url="https://billing.stripe.test/portal")

        response = self.client.post(reverse("billing-portal"), {}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["portal_url"], "https://billing.stripe.test/portal")

    @patch("billing.views.stripe.Webhook.construct_event")
    def test_webhook_creates_subscription(self, construct_event):
        self.client.force_authenticate(user=None)
        construct_event.return_value = {
            "type": "customer.subscription.created",
            "data": {"object": {
                "id": "sub_test",
                "customer": "cus_test",
                "status": "active",
                "cancel_at_period_end": False,
                "current_period_end": 1800000000,
                "metadata": {
                    "user_id": str(self.user.pk),
                    "plan": "supported",
                    "subject": "chemistry",
                    "billing_cycle": "monthly",
                },
                "items": {"data": [{"price": {"id": "price_supported_month"}}]},
            }},
        }

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        membership = MembershipSubscription.objects.get(stripe_subscription_id="sub_test")
        self.assertEqual(membership.user, self.user)
        self.assertEqual(membership.plan, "supported")
        self.assertEqual(membership.subject, "chemistry")
        self.assertTrue(membership.has_access)

    @patch("billing.views.stripe.Webhook.construct_event")
    def test_annual_payment_webhook_grants_one_year_without_subscription(self, construct_event):
        self.client.force_authenticate(user=None)
        construct_event.return_value = {
            "type": "checkout.session.completed",
            "data": {"object": {
                "id": "cs_annual",
                "customer": "cus_annual",
                "subscription": None,
                "payment_intent": "pi_annual",
                "payment_status": "paid",
                "metadata": {
                    "user_id": str(self.user.pk),
                    "plan": "self-study",
                    "subject": "physics",
                    "billing_cycle": "annual",
                    "price_id": "price_self_year",
                },
            }},
        }

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        membership = MembershipSubscription.objects.get(
            stripe_checkout_session_id="cs_annual"
        )
        self.assertIsNone(membership.stripe_subscription_id)
        self.assertEqual(membership.stripe_payment_intent_id, "pi_annual")
        self.assertEqual(membership.billing_cycle, "annual")
        self.assertGreater(
            membership.current_period_end,
            timezone.now() + timedelta(days=364),
        )
        self.assertTrue(membership.has_access)

        original_expiry = membership.current_period_end
        self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )
        membership.refresh_from_db()
        self.assertEqual(membership.current_period_end, original_expiry)
        self.assertEqual(
            MembershipSubscription.objects.filter(
                stripe_checkout_session_id="cs_annual"
            ).count(),
            1,
        )

    @patch("billing.views.stripe.Webhook.construct_event")
    def test_annual_webhook_records_referral_reward_due_date(self, construct_event):
        referrer = CustomUser.objects.create_user(
            email="annual-referrer@example.com",
            password="test-password",
            school="Test School",
        )
        referral = Referral.objects.create(
            referrer=referrer,
            referred_user=self.user,
            code_used=referrer.referral_code.code,
        )
        construct_event.return_value = {
            "type": "checkout.session.completed",
            "data": {"object": {
                "id": "cs_referred_annual",
                "customer": "cus_referred_annual",
                "subscription": None,
                "payment_intent": "pi_referred_annual",
                "payment_status": "paid",
                "metadata": {
                    "user_id": str(self.user.pk),
                    "plan": "self-study",
                    "subject": "physics",
                    "billing_cycle": "annual",
                    "price_id": "price_self_year",
                    "referral_id": str(referral.pk),
                    "referral_discount_amount": "1900",
                },
            }},
        }
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        referral.refresh_from_db()
        self.assertIsNotNone(referral.qualifying_membership)
        self.assertEqual(referral.friend_discount_amount, 1900)
        self.assertGreater(referral.reward_due_at, timezone.now() + timedelta(days=29))

    @patch("billing.referrals.send_referral_reward_email")
    @patch("billing.referrals.stripe.Refund.create")
    @patch("billing.referrals.stripe.PaymentIntent.retrieve")
    def test_due_referral_refunds_referrers_annual_payment_once(
        self,
        retrieve_payment,
        create_refund,
        send_reward_email,
    ):
        referrer = CustomUser.objects.create_user(
            email="reward-referrer@example.com",
            password="test-password",
            school="Test School",
        )
        referrer_membership = MembershipSubscription.objects.create(
            user=referrer,
            stripe_customer_id="cus_reward_referrer",
            stripe_payment_intent_id="pi_reward_referrer",
            stripe_checkout_session_id="cs_reward_referrer",
            stripe_price_id="price_supported_year",
            plan=MembershipSubscription.PLAN_SUPPORTED,
            subject=MembershipSubscription.SUBJECT_CHEMISTRY,
            billing_cycle=MembershipSubscription.BILLING_ANNUAL,
            status="active",
            current_period_end=timezone.now() + timedelta(days=200),
        )
        referred_membership = MembershipSubscription.objects.create(
            user=self.user,
            stripe_customer_id="cus_referred_reward",
            stripe_payment_intent_id="pi_referred_reward",
            stripe_checkout_session_id="cs_referred_reward",
            stripe_price_id="price_self_year",
            plan=MembershipSubscription.PLAN_SELF_STUDY,
            subject=MembershipSubscription.SUBJECT_PHYSICS,
            billing_cycle=MembershipSubscription.BILLING_ANNUAL,
            status="active",
            current_period_end=timezone.now() + timedelta(days=200),
        )
        referral = Referral.objects.create(
            referrer=referrer,
            referred_user=self.user,
            code_used=referrer.referral_code.code,
            qualifying_membership=referred_membership,
            reward_due_at=timezone.now() - timedelta(minutes=1),
            friend_discount_amount=1900,
        )
        clean_charge = {
            "amount": 13000,
            "amount_refunded": 0,
            "refunded": False,
            "disputed": False,
        }
        retrieve_payment.side_effect = [
            {"status": "succeeded", "latest_charge": clean_charge},
            {"status": "succeeded", "latest_charge": {**clean_charge, "amount": 27900}},
        ]
        create_refund.return_value = {"id": "re_referral_reward"}

        outcome = process_resource_referral(referral)

        self.assertEqual(outcome, "rewarded")
        referral.refresh_from_db()
        self.assertEqual(referral.status, Referral.STATUS_REWARDED)
        self.assertEqual(referral.referrer_reward_amount, 3500)
        self.assertEqual(referral.stripe_refund_id, "re_referral_reward")
        create_refund.assert_called_once_with(
            payment_intent=referrer_membership.stripe_payment_intent_id,
            amount=3500,
            metadata={
                "chuba_referral_id": str(referral.pk),
                "referred_user_id": str(self.user.pk),
                "referrer_user_id": str(referrer.pk),
            },
            idempotency_key=f"chuba-referral-{referral.pk}-resource-refund",
        )
        self.assertEqual(process_resource_referral(referral), "already_rewarded")
        self.assertEqual(create_refund.call_count, 1)
        send_reward_email.assert_called_once_with(referral)

    @patch("billing.views.stripe.Refund.list")
    @patch("billing.views.stripe.Webhook.construct_event")
    def test_full_refund_removes_annual_access_and_disqualifies_referral(self, construct_event, list_refunds):
        membership = MembershipSubscription.objects.create(
            user=self.user,
            stripe_customer_id="cus_full_refund",
            stripe_payment_intent_id="pi_full_refund",
            stripe_checkout_session_id="cs_full_refund",
            stripe_price_id="price_self_year",
            plan=MembershipSubscription.PLAN_SELF_STUDY,
            subject=MembershipSubscription.SUBJECT_PHYSICS,
            billing_cycle=MembershipSubscription.BILLING_ANNUAL,
            status="active",
            current_period_end=timezone.now() + timedelta(days=300),
        )
        referrer = CustomUser.objects.create_user(
            email="refund-referrer@example.com",
            password="test-password",
            school="Test School",
        )
        referral = Referral.objects.create(
            referrer=referrer,
            referred_user=self.user,
            code_used=referrer.referral_code.code,
            qualifying_membership=membership,
            reward_due_at=timezone.now() + timedelta(days=20),
        )
        construct_event.return_value = {
            "type": "charge.refunded",
            "data": {"object": {
                "payment_intent": membership.stripe_payment_intent_id,
                "amount": 13000,
                "amount_refunded": 13000,
            }},
        }
        list_refunds.return_value = {
            "data": [{
                "amount": 13000,
                "status": "succeeded",
                "metadata": {},
            }]
        }
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        referral.refresh_from_db()
        self.assertEqual(membership.status, "refunded")
        self.assertFalse(membership.has_access)
        self.assertEqual(referral.status, Referral.STATUS_DISQUALIFIED)

    @patch("billing.views.stripe.Refund.list")
    @patch("billing.views.stripe.Webhook.construct_event")
    def test_referral_reward_refunds_do_not_remove_access(self, construct_event, list_refunds):
        membership = MembershipSubscription.objects.create(
            user=self.user,
            stripe_customer_id="cus_reward_only",
            stripe_payment_intent_id="pi_reward_only",
            stripe_checkout_session_id="cs_reward_only",
            stripe_price_id="price_self_year",
            plan=MembershipSubscription.PLAN_SELF_STUDY,
            subject=MembershipSubscription.SUBJECT_PHYSICS,
            billing_cycle=MembershipSubscription.BILLING_ANNUAL,
            status="active",
            current_period_end=timezone.now() + timedelta(days=300),
        )
        construct_event.return_value = {
            "type": "charge.refunded",
            "data": {"object": {
                "payment_intent": membership.stripe_payment_intent_id,
                "amount": 14900,
                "amount_refunded": 14900,
            }},
        }
        list_refunds.return_value = {
            "data": [{
                "amount": 14900,
                "status": "succeeded",
                "metadata": {"chuba_referral_id": "123"},
            }]
        }
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        self.assertEqual(membership.status, "active")
        self.assertTrue(membership.has_access)

    def test_expired_annual_payment_no_longer_grants_access(self):
        membership = MembershipSubscription.objects.create(
            user=self.user,
            stripe_customer_id="cus_expired",
            stripe_payment_intent_id="pi_expired",
            stripe_checkout_session_id="cs_expired",
            stripe_price_id="price_self_year",
            plan=MembershipSubscription.PLAN_SELF_STUDY,
            subject=MembershipSubscription.SUBJECT_PHYSICS,
            billing_cycle=MembershipSubscription.BILLING_ANNUAL,
            status="active",
            current_period_end=timezone.now() - timedelta(seconds=1),
        )

        self.assertFalse(membership.has_access)
        self.assertFalse(has_subject_access(self.user, "physics"))

    @patch("billing.views.stripe.Webhook.construct_event")
    def test_cancellation_at_period_end_preserves_access_until_expiry(self, construct_event):
        membership = self.create_monthly_membership()
        expiry = timezone.now() + timedelta(days=12)
        construct_event.return_value = {
            "type": "customer.subscription.updated",
            "data": {"object": {
                "id": membership.stripe_subscription_id,
                "customer": membership.stripe_customer_id,
                "status": "active",
                "cancel_at_period_end": True,
                "metadata": {},
                "items": {"data": [{
                    "price": {"id": membership.stripe_price_id},
                    "current_period_end": int(expiry.timestamp()),
                }]},
            }},
        }
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        self.assertTrue(membership.cancel_at_period_end)
        self.assertEqual(membership.status, "active")
        self.assertTrue(membership.has_access)

    @patch("billing.views.stripe.Webhook.construct_event")
    def test_deleted_subscription_removes_access(self, construct_event):
        membership = self.create_monthly_membership()
        construct_event.return_value = {
            "type": "customer.subscription.deleted",
            "data": {"object": {
                "id": membership.stripe_subscription_id,
                "customer": membership.stripe_customer_id,
                "status": "canceled",
                "cancel_at_period_end": False,
                "metadata": {},
                "items": {"data": [{"price": {"id": membership.stripe_price_id}}]},
            }},
        }
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        self.assertEqual(membership.status, "canceled")
        self.assertFalse(membership.has_access)
        self.assertFalse(has_subject_access(self.user, "physics"))

    @patch("billing.views.stripe.Webhook.construct_event")
    def test_failed_monthly_payment_removes_access(self, construct_event):
        membership = self.create_monthly_membership()
        construct_event.return_value = {
            "type": "invoice.payment_failed",
            "data": {"object": {"subscription": membership.stripe_subscription_id}},
        }
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        self.assertEqual(membership.status, "past_due")
        self.assertFalse(membership.has_access)

    @patch("billing.views.stripe.Subscription.retrieve")
    @patch("billing.views.stripe.Webhook.construct_event")
    def test_paid_retry_restores_access(self, construct_event, retrieve_subscription):
        membership = self.create_monthly_membership(status="past_due")
        expiry = timezone.now() + timedelta(days=30)
        construct_event.return_value = {
            "type": "invoice.paid",
            "data": {"object": {"subscription": membership.stripe_subscription_id}},
        }
        retrieve_subscription.return_value = {
            "id": membership.stripe_subscription_id,
            "customer": membership.stripe_customer_id,
            "status": "active",
            "cancel_at_period_end": False,
            "metadata": {},
            "items": {"data": [{
                "price": {"id": membership.stripe_price_id},
                "current_period_end": int(expiry.timestamp()),
            }]},
        }
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("stripe-webhook"),
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        self.assertEqual(membership.status, "active")
        self.assertTrue(membership.has_access)
