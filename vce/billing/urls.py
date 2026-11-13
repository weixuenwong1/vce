from django.urls import path

from .views import (
    CheckoutSessionStatusView,
    CreateCheckoutSessionView,
    CustomerPortalView,
    ReferralOfferView,
    stripe_webhook,
)


urlpatterns = [
    path("checkout/", CreateCheckoutSessionView.as_view(), name="billing-checkout"),
    path("checkout-status/", CheckoutSessionStatusView.as_view(), name="billing-checkout-status"),
    path("portal/", CustomerPortalView.as_view(), name="billing-portal"),
    path("referral-offer/", ReferralOfferView.as_view(), name="billing-referral-offer"),
    path("webhook/", stripe_webhook, name="stripe-webhook"),
]
