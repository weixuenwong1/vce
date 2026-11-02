from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser, UserSubjectEngagement
from api.views import (
    PRACTICE_SAC_BASELINE,
    QUESTION_ATTEMPTED_BASELINE,
    SUMMARY_OPENED_BASELINE,
)
from contents.models import Subject


class HomeStatsTests(TestCase):
    def test_home_stats_include_recorded_activity_and_baselines(self):
        subject = Subject.objects.create(name="Physics")
        user = CustomUser.objects.create_user(
            email="stats@example.com",
            password="test-password",
            school="Test School",
        )
        UserSubjectEngagement.objects.create(
            user=user,
            subject=subject,
            questions_viewed=37,
            summaries_viewed=12,
            practice_sacs_started=4,
        )

        response = APIClient().get("/api/home-stats/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {
                "questions_attempted": QUESTION_ATTEMPTED_BASELINE + 37,
                "summaries_opened": SUMMARY_OPENED_BASELINE + 12,
                "practice_sacs_attempted": PRACTICE_SAC_BASELINE + 4,
            },
        )
