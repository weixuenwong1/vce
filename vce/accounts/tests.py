from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from contents.models import Subject

from .models import (
    CustomUser,
    Referral,
    ReferralCode,
    TutoringInterest,
    UserSubjectEngagement,
)


class ReferralTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.referrer = CustomUser.objects.create_user(
            email="referrer@example.com",
            password="test-password",
            school="Test School",
        )

    def test_new_user_receives_unique_referral_code(self):
        code = ReferralCode.objects.get(user=self.referrer)

        self.assertTrue(code.code.startswith("CHUBA-"))
        self.assertEqual(len(code.code), 14)

    def test_registration_with_referral_code_records_attribution(self):
        code = self.referrer.referral_code.code

        response = self.client.post(
            "/register/",
            {
                "email": "friend@example.com",
                "password": "friend-password",
                "school": "Friend School",
                "referral_code": code.lower(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        friend = CustomUser.objects.get(email="friend@example.com")
        referral = Referral.objects.get(referred_user=friend)
        self.assertEqual(referral.referrer, self.referrer)
        self.assertEqual(referral.code_used, code)
        self.assertEqual(referral.status, Referral.STATUS_REGISTERED)

    def test_registration_rejects_unknown_referral_code(self):
        response = self.client.post(
            "/register/",
            {
                "email": "friend@example.com",
                "password": "friend-password",
                "school": "Friend School",
                "referral_code": "CHUBA-NOTREAL1",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("referral_code", response.data)
        self.assertFalse(CustomUser.objects.filter(email="friend@example.com").exists())

    def test_referral_details_requires_sign_in_and_returns_personal_code(self):
        signed_out_response = self.client.get("/api/referrals/me/")
        self.assertEqual(signed_out_response.status_code, 401)

        self.client.force_authenticate(user=self.referrer)
        response = self.client.get("/api/referrals/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["code"], self.referrer.referral_code.code)
        self.assertEqual(response.data["successful_referrals"], 0)
        self.assertEqual(response.data["pending_referrals"], 0)


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


class TutoringInterestAdminTests(TestCase):
    def setUp(self):
        self.admin_user = CustomUser.objects.create_superuser(
            email="admin@example.com",
            password="test-password",
            school="Chuba",
        )
        self.enquiry = TutoringInterest.objects.create(
            student_name="Alex Student",
            email="alex@example.com",
            subject=TutoringInterest.SUBJECT_PHYSICS,
            year_level="Year 12",
            preferred_format=TutoringInterest.FORMAT_SMALL_GROUP,
            goals="Prepare for SACs",
            availability="Thursday evenings",
        )
        self.client.force_login(self.admin_user)

    def test_admin_lists_tutoring_enquiry(self):
        response = self.client.get(reverse("admin:accounts_tutoringinterest_changelist"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Alex Student")
        self.assertContains(response, "alex@example.com")
        self.assertContains(response, "Physics")
