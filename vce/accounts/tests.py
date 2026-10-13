from django.test import TestCase
from django.urls import reverse

from contents.models import Subject

from .models import CustomUser, UserSubjectEngagement


class EngagementDashboardAdminTests(TestCase):
    def setUp(self):
        self.admin_user = CustomUser.objects.create_superuser(
            email="admin@example.com",
            password="test-password",
            school="Chuba",
        )
        self.student = CustomUser.objects.create_user(
            email="student@example.com",
            password="test-password",
            school="Test School",
        )
        physics = Subject.objects.create(name="Physics")
        UserSubjectEngagement.objects.create(
            user=self.student,
            subject=physics,
            questions_viewed=12,
            summaries_viewed=3,
            practice_sacs_started=2,
        )
        self.client.force_login(self.admin_user)

    def test_dashboard_shows_totals_and_subject_breakdown(self):
        response = self.client.get(
            reverse("admin:accounts_userengagementdashboard_changelist")
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Current users")
        self.assertContains(response, "student@example.com")
        self.assertContains(
            response,
            reverse("admin:accounts_customuser_change", args=[self.student.pk]),
        )
        self.assertContains(response, "Questions viewed")
        self.assertContains(response, "Q <b>12</b>", html=True)
        self.assertContains(response, "SAC <b>2</b>", html=True)
