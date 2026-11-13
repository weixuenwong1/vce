import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_seed_question_engagement"),
    ]

    operations = [
        migrations.CreateModel(
            name="TutoringInterest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("student_name", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(blank=True, max_length=40)),
                ("phone_contact_consent", models.BooleanField(default=False)),
                ("subject", models.CharField(choices=[("physics", "Physics"), ("chemistry", "Chemistry"), ("biology", "Biology")], max_length=20)),
                ("year_level", models.CharField(max_length=30)),
                ("preferred_format", models.CharField(choices=[("small_group", "Small group"), ("individual", "Individual"), ("unsure", "Not sure yet")], max_length=20)),
                ("goals", models.TextField()),
                ("availability", models.TextField()),
                ("guardian_name", models.CharField(blank=True, max_length=150)),
                ("guardian_email", models.EmailField(blank=True, max_length=254)),
                ("status", models.CharField(choices=[("new", "New"), ("contacted", "Contacted"), ("intro_booked", "Intro booked"), ("matched", "Tutor matched"), ("enrolled", "Enrolled"), ("waitlisted", "Waitlisted"), ("closed", "Closed")], db_index=True, default="new", max_length=20)),
                ("admin_notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="tutoring_interests", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "tutoring enquiry",
                "verbose_name_plural": "tutoring enquiries",
                "ordering": ["-created_at"],
            },
        ),
    ]
