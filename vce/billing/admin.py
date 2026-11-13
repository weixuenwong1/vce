from django.contrib import admin

from .models import BillingCustomer, MembershipSubscription


@admin.register(BillingCustomer)
class BillingCustomerAdmin(admin.ModelAdmin):
    list_display = ("user", "stripe_customer_id", "created_at")
    search_fields = ("user__email", "stripe_customer_id")
    readonly_fields = ("user", "stripe_customer_id", "created_at", "updated_at")


@admin.register(MembershipSubscription)
class MembershipSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "plan",
        "subject",
        "billing_cycle",
        "status",
        "cancel_at_period_end",
        "access_ends",
    )
    list_filter = ("status", "plan", "subject", "billing_cycle", "cancel_at_period_end")
    search_fields = (
        "user__email",
        "stripe_customer_id",
        "stripe_subscription_id",
        "stripe_payment_intent_id",
        "stripe_checkout_session_id",
    )
    readonly_fields = (
        "user",
        "stripe_customer_id",
        "stripe_subscription_id",
        "stripe_payment_intent_id",
        "stripe_checkout_session_id",
        "stripe_price_id",
        "plan",
        "subject",
        "billing_cycle",
        "status",
        "current_period_end",
        "cancel_at_period_end",
        "created_at",
        "updated_at",
    )

    @admin.display(description="Access ends", ordering="current_period_end")
    def access_ends(self, obj):
        return obj.current_period_end
