from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse 
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags


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
