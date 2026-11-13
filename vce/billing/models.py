from django.conf import settings
from django.db import models
from django.utils import timezone


class BillingCustomer(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="billing_customer",
    )
    stripe_customer_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} ({self.stripe_customer_id})"


class MembershipSubscription(models.Model):
    PLAN_SELF_STUDY = "self-study"
    PLAN_SUPPORTED = "supported"
    PLAN_CHOICES = (
        (PLAN_SELF_STUDY, "Chuba Self Study"),
        (PLAN_SUPPORTED, "Chuba Supported"),
    )

    SUBJECT_PHYSICS = "physics"
    SUBJECT_CHEMISTRY = "chemistry"
    SUBJECT_BIOLOGY = "biology"
    SUBJECT_CHOICES = (
        (SUBJECT_PHYSICS, "Physics"),
        (SUBJECT_CHEMISTRY, "Chemistry"),
        (SUBJECT_BIOLOGY, "Biology"),
    )

    BILLING_MONTHLY = "monthly"
    BILLING_ANNUAL = "annual"
    BILLING_CHOICES = (
        (BILLING_MONTHLY, "Monthly"),
        (BILLING_ANNUAL, "Annual"),
    )

    ACCESS_STATUSES = {"active", "trialing"}
    OPEN_STATUSES = {"active", "trialing", "past_due", "incomplete", "paused"}

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="membership_subscriptions",
    )
    stripe_customer_id = models.CharField(max_length=255, db_index=True)
    stripe_subscription_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
    )
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
    )
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True)
    stripe_price_id = models.CharField(max_length=255)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    billing_cycle = models.CharField(max_length=10, choices=BILLING_CHOICES)
    status = models.CharField(max_length=30, default="incomplete", db_index=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    @property
    def has_access(self):
        if self.status not in self.ACCESS_STATUSES:
            return False
        return not self.current_period_end or self.current_period_end > timezone.now()

    def __str__(self):
        return f"{self.user.email} - {self.get_plan_display()} - {self.get_subject_display()}"
