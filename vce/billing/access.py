from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from .models import MembershipSubscription


def paid_access_enforced_for(user):
    """Return whether membership checks are enabled for this account."""
    if settings.PAID_ACCESS_ENFORCEMENT_ENABLED:
        return True

    email = str(getattr(user, "email", "")).strip().lower()
    return email in getattr(settings, "PAID_ACCESS_TEST_EMAILS", set())


def has_subject_access(user, subject):
    """Return whether a user can access paid resources for one subject."""
    if not getattr(user, "is_authenticated", False):
        return False
    if user.is_staff or user.is_superuser:
        return True
    if not paid_access_enforced_for(user):
        return True

    subject_slug = getattr(subject, "name", subject)
    return MembershipSubscription.objects.filter(
        user=user,
        subject__iexact=str(subject_slug).strip(),
        status__in=MembershipSubscription.ACCESS_STATUSES,
    ).filter(
        Q(current_period_end__isnull=True) | Q(current_period_end__gt=timezone.now())
    ).exists()
