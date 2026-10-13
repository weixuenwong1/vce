from django.db.models import F
from django.utils import timezone

from .models import UserSubjectEngagement


TRACKED_COUNTERS = {
    "questions_viewed",
    "summaries_viewed",
    "practice_sacs_started",
}


def record_engagement(user, subject, counter):
    """Increment a compact per-user, per-subject engagement counter."""
    if not getattr(user, "is_authenticated", False):
        return
    if counter not in TRACKED_COUNTERS:
        raise ValueError(f"Unsupported engagement counter: {counter}")

    now = timezone.now()
    engagement, created = UserSubjectEngagement.objects.get_or_create(
        user=user,
        subject=subject,
        defaults={
            counter: 1,
            "first_activity_at": now,
            "last_activity_at": now,
        },
    )
    if not created:
        UserSubjectEngagement.objects.filter(pk=engagement.pk).update(
            **{
                counter: F(counter) + 1,
                "last_activity_at": now,
            }
        )
