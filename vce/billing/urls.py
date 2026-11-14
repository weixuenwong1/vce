from django.urls import path

from .views import (
    CheckoutSessionStatusView,
    CreateCheckoutSessionView,
    CustomerPortalView,
    ReferralOfferView,
    SubjectAccessView,
    stripe_webhook,
)


urlpatterns = [
    path("checkout/", CreateCheckoutSessionView.as_view(), name="billing-checkout"),
    path("checkout-status/", CheckoutSessionStatusView.as_view(), name="billing-checkout-status"),
    path("portal/", CustomerPortalView.as_view(), name="billing-portal"),
    path("referral-offer/", ReferralOfferView.as_view(), name="billing-referral-offer"),
    path("access/<str:subject>/", SubjectAccessView.as_view(), name="billing-subject-access"),
    path("webhook/", stripe_webhook, name="stripe-webhook"),
]
