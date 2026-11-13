from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse 
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.db.models.signals import post_save
import uuid


def generate_referral_code():
    return f"CHUBA-{uuid.uuid4().hex[:8].upper()}"


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields ):
        if not email:
            raise ValueError('Email is a required field')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    email = models.EmailField(max_length=255, unique=True)
    school = models.CharField(max_length=255)
    teacher = models.BooleanField(default=False)
    username = models.CharField(max_length=200, null=True, blank=True)

    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['school']

    def __str__(self):
        return self.email


class ReferralCode(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="referral_code",
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        default=generate_referral_code,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.code}"


class Referral(models.Model):
    STATUS_REGISTERED = "registered"
    STATUS_QUALIFIED = "qualified"
    STATUS_REWARDED = "rewarded"
    STATUS_DISQUALIFIED = "disqualified"
    STATUS_CHOICES = (
        (STATUS_REGISTERED, "Registered"),
        (STATUS_QUALIFIED, "Qualified"),
        (STATUS_REWARDED, "Rewarded"),
        (STATUS_DISQUALIFIED, "Disqualified"),
    )

    referrer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="referrals_made",
    )
    referred_user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="referral_received",
    )
    code_used = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_REGISTERED,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    qualified_at = models.DateTimeField(null=True, blank=True)
    rewarded_at = models.DateTimeField(null=True, blank=True)
    qualifying_membership = models.ForeignKey(
        "billing.MembershipSubscription",
        on_delete=models.SET_NULL,
        related_name="qualifying_referrals",
        null=True,
        blank=True,
    )
    reward_due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    friend_discount_amount = models.PositiveIntegerField(default=0)
    referrer_reward_amount = models.PositiveIntegerField(default=0)
    stripe_refund_id = models.CharField(max_length=255, blank=True, unique=True, null=True)
    last_reward_attempt_at = models.DateTimeField(null=True, blank=True)
    reward_error = models.TextField(blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.referrer.email} referred {self.referred_user.email}"


@receiver(post_save, sender=CustomUser)
def ensure_referral_code(sender, instance, created, **kwargs):
    if created:
        ReferralCode.objects.get_or_create(user=instance)


class UserSubjectEngagement(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="subject_engagement",
    )
    subject = models.ForeignKey(
        "contents.Subject",
        on_delete=models.PROTECT,
        related_name="user_engagement",
    )
    questions_viewed = models.PositiveBigIntegerField(default=0)
    questions_attempted = models.PositiveBigIntegerField(default=0)
    summaries_viewed = models.PositiveBigIntegerField(default=0)
    practice_sacs_started = models.PositiveBigIntegerField(default=0)
    first_activity_at = models.DateTimeField(null=True, blank=True)
    last_activity_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "subject"],
                name="uq_engagement_user_subject",
            )
        ]
        ordering = ["user__email", "subject__name"]
        verbose_name = "user subject engagement"
        verbose_name_plural = "user subject engagement"

    def __str__(self):
        return f"{self.user.email} - {self.subject.name}"


class UserEngagementDashboard(CustomUser):
    class Meta:
        proxy = True
        verbose_name = "engagement dashboard"
        verbose_name_plural = "engagement dashboard"


class TutoringInterest(models.Model):
    SUBJECT_PHYSICS = "physics"
    SUBJECT_CHEMISTRY = "chemistry"
    SUBJECT_BIOLOGY = "biology"
    SUBJECT_CHOICES = (
        (SUBJECT_PHYSICS, "Physics"),
        (SUBJECT_CHEMISTRY, "Chemistry"),
        (SUBJECT_BIOLOGY, "Biology"),
    )

    FORMAT_SMALL_GROUP = "small_group"
    FORMAT_INDIVIDUAL = "individual"
    FORMAT_UNSURE = "unsure"
    FORMAT_CHOICES = (
        (FORMAT_SMALL_GROUP, "Small group"),
        (FORMAT_INDIVIDUAL, "Individual"),
        (FORMAT_UNSURE, "Not sure yet"),
    )

    STATUS_NEW = "new"
    STATUS_CONTACTED = "contacted"
    STATUS_INTRO_BOOKED = "intro_booked"
    STATUS_MATCHED = "matched"
    STATUS_ENROLLED = "enrolled"
    STATUS_WAITLISTED = "waitlisted"
    STATUS_CLOSED = "closed"
    STATUS_CHOICES = (
        (STATUS_NEW, "New"),
        (STATUS_CONTACTED, "Contacted"),
        (STATUS_INTRO_BOOKED, "Intro booked"),
        (STATUS_MATCHED, "Tutor matched"),
        (STATUS_ENROLLED, "Enrolled"),
        (STATUS_WAITLISTED, "Waitlisted"),
        (STATUS_CLOSED, "Closed"),
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name="tutoring_interests",
        null=True,
        blank=True,
    )
    student_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    phone_contact_consent = models.BooleanField(default=False)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    year_level = models.CharField(max_length=30)
    preferred_format = models.CharField(max_length=20, choices=FORMAT_CHOICES)
    goals = models.TextField()
    availability = models.TextField()
    guardian_name = models.CharField(max_length=150, blank=True)
    guardian_email = models.EmailField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
        db_index=True,
    )
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "tutoring enquiry"
        verbose_name_plural = "tutoring enquiries"

    def __str__(self):
        return f"{self.student_name} - {self.get_subject_display()}"
    
 
@receiver(reset_password_token_created)
def password_reset_token_created(reset_password_token, *args, **kwargs):
    sitelink = "https://chuba.io/"
    token = "{}".format(reset_password_token.key)
    full_link = str(sitelink)+str("password-reset/")+str(token)

    context = {
        "full_link": full_link,
        "email_address": reset_password_token.user.email
    }

    html_message = render_to_string("backend/email.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject = "Reset your password",
        body=plain_message,
        from_email = "noreply@chuba.io",
        to=[reset_password_token.user.email]

    )

    msg.attach_alternative(html_message, "text/html")
    msg.send()
