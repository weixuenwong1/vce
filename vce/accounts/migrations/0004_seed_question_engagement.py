from django.db import migrations
from django.db.models import Count, Max, Min


def seed_question_engagement(apps, schema_editor):
    SeenQuestion = apps.get_model("problems", "SeenQuestion")
    UserSubjectEngagement = apps.get_model("accounts", "UserSubjectEngagement")

    retained_activity = (
        SeenQuestion.objects.values("user_id", "topic__chapter__subject_id")
        .annotate(
            question_count=Count("id"),
            first_seen=Min("created_at"),
            last_seen=Max("created_at"),
        )
        .iterator(chunk_size=1000)
    )

    rows = []
    for activity in retained_activity:
        subject_id = activity["topic__chapter__subject_id"]
        if subject_id is None:
            continue
        rows.append(
            UserSubjectEngagement(
                user_id=activity["user_id"],
                subject_id=subject_id,
                questions_viewed=activity["question_count"],
                first_activity_at=activity["first_seen"],
                last_activity_at=activity["last_seen"],
            )
        )
        if len(rows) >= 1000:
            UserSubjectEngagement.objects.bulk_create(rows, ignore_conflicts=True)
            rows.clear()

    if rows:
        UserSubjectEngagement.objects.bulk_create(rows, ignore_conflicts=True)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_userengagementdashboard_usersubjectengagement_and_more"),
        ("problems", "0005_question_multiple_choice"),
    ]

    operations = [
        migrations.RunPython(seed_question_engagement, migrations.RunPython.noop),
    ]
