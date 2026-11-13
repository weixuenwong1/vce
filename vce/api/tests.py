from datetime import timedelta
from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import CustomUser, TutoringInterest, UserSubjectEngagement
from api.views import (
    CURATED_QUESTION_PREVIEWS,
    PRACTICE_SAC_BASELINE,
    QUESTION_ATTEMPTED_BASELINE,
    PUBLIC_FULL_SUMMARIES,
    SUMMARY_OPENED_BASELINE,
)
from contents.models import Chapter, Subject, Topic
from problems.models import Question, QuestionIssueReport, SeenQuestion
from billing.models import MembershipSubscription


@override_settings(PAID_ACCESS_ENFORCEMENT_ENABLED=True)
class PublicResourcePreviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.subject = Subject.objects.create(name="Physics")
        self.chapter = Chapter.objects.create(
            chapter_name="Motion and Energy",
            chapter_description="Motion chapter",
            subject=self.subject,
            slug="motion-and-energy",
        )
        self.topic = Topic.objects.create(
            chapter=self.chapter,
            topic_name="Projectile Motion",
            slug="projectile-motion",
            content=("Preview paragraph. " * 60) + "\n\n" + ("Members paragraph. " * 80),
        )
        self.questions = []
        for index in range(4):
            question = Question.objects.create(
                question_text=f"Question {index + 1}",
                difficulty="Easy",
            )
            question.topic.add(self.topic)
            self.questions.append(question)

        self.summary_url = "/api/summary/physics/motion-and-energy/projectile-motion/"
        self.problems_url = "/api/problems/physics/motion-and-energy/projectile-motion/"
        self.report_url = (
            f"/api/problems/physics/motion-and-energy/projectile-motion/"
            f"{self.questions[0].pk}/report/"
        )
        self.attempt_url = (
            f"/api/problems/physics/motion-and-energy/projectile-motion/"
            f"{self.questions[0].pk}/attempt/"
        )
        self.catalogue_url = "/api/catalogue/physics/"

    def test_home_stats_adds_activity_baselines(self):
        user = CustomUser.objects.create_user(
            email="stats@example.com",
            password="test-password",
            school="Test School",
        )
        UserSubjectEngagement.objects.create(
            user=user,
            subject=self.subject,
            questions_viewed=37,
            summaries_viewed=12,
            practice_sacs_started=4,
        )

        response = self.client.get("/api/home-stats/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["questions_attempted"],
            QUESTION_ATTEMPTED_BASELINE + 37,
        )
        self.assertEqual(
            response.data["summaries_opened"],
            SUMMARY_OPENED_BASELINE + 12,
        )
        self.assertEqual(
            response.data["practice_sacs_attempted"],
            PRACTICE_SAC_BASELINE + 4,
        )

    def test_opening_a_solution_records_an_attempt(self):
        user = CustomUser.objects.create_user(
            email="attempt@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(self.attempt_url, {}, format="json")

        self.assertEqual(response.status_code, 204)
        engagement = UserSubjectEngagement.objects.get(user=user, subject=self.subject)
        self.assertEqual(engagement.questions_attempted, 1)

    def create_membership(self, user, subject="physics", status="active"):
        return MembershipSubscription.objects.create(
            user=user,
            stripe_customer_id=f"cus_{user.pk}",
            stripe_subscription_id=f"sub_{user.pk}_{subject}",
            stripe_price_id="price_test",
            plan=MembershipSubscription.PLAN_SELF_STUDY,
            subject=subject,
            billing_cycle=MembershipSubscription.BILLING_MONTHLY,
            status=status,
        )

    def test_subject_catalogue_returns_chapters_and_topics_together(self):
        with self.assertNumQueries(2):
            response = self.client.get(self.catalogue_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["chapter_name"], "Motion and Energy")
        self.assertEqual(response.data[0]["topics"][0]["topic_name"], "Projectile Motion")
        self.assertIn("max-age=300", response["Cache-Control"])

    def test_anonymous_summary_is_truncated(self):
        response = self.client.get(self.summary_url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_preview"])
        self.assertLess(len(response.data["content"]), len(self.topic.content))
        self.assertFalse(UserSubjectEngagement.objects.exists())

    def test_selected_first_chapter_summaries_are_fully_public(self):
        public_content = ("Complete public summary. " * 120).strip()
        subjects = {"physics": self.subject}

        for subject_slug, chapter_slug, topic_slug in PUBLIC_FULL_SUMMARIES:
            with self.subTest(chapter=chapter_slug, topic=topic_slug):
                subject = subjects.get(subject_slug)
                if subject is None:
                    subject = Subject.objects.create(name=subject_slug.title())
                    subjects[subject_slug] = subject
                if chapter_slug == self.chapter.slug:
                    chapter = self.chapter
                else:
                    chapter = Chapter.objects.create(
                        chapter_name=chapter_slug.replace("-", " ").title(),
                        chapter_description=f"{chapter_slug} chapter",
                        subject=subject,
                        slug=chapter_slug,
                    )
                Topic.objects.create(
                    chapter=chapter,
                    topic_name=topic_slug.replace("-", " ").title(),
                    slug=topic_slug,
                    content=public_content,
                )

                response = self.client.get(
                    f"/api/summary/{subject_slug}/{chapter_slug}/{topic_slug}/"
                )

                self.assertEqual(response.status_code, 200)
                self.assertFalse(response.data["is_preview"])
                self.assertFalse(response.data["requires_subscription"])
                self.assertEqual(response.data["content"], public_content)

        self.assertFalse(UserSubjectEngagement.objects.exists())

    def test_paid_member_summary_is_complete(self):
        user = CustomUser.objects.create_user(
            email="student@example.com",
            password="test-password",
            school="Test School",
        )
        self.create_membership(user)
        self.client.force_authenticate(user=user)

        response = self.client.get(self.summary_url)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_preview"])
        self.assertEqual(response.data["content"], self.topic.content)
        engagement = UserSubjectEngagement.objects.get(user=user, subject=self.subject)
        self.assertEqual(engagement.summaries_viewed, 1)

    def test_authenticated_unpaid_summary_remains_a_preview(self):
        user = CustomUser.objects.create_user(
            email="free-student@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.get(self.summary_url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_preview"])
        self.assertTrue(response.data["requires_subscription"])
        self.assertFalse(UserSubjectEngagement.objects.filter(user=user).exists())

    def test_short_summary_is_still_incomplete_without_membership(self):
        self.topic.content = "Short but paid summary content. " * 12
        self.topic.save(update_fields=["content"])

        response = self.client.get(self.summary_url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_preview"])
        self.assertLess(len(response.data["content"]), len(self.topic.content))

    def test_membership_for_another_subject_does_not_unlock_summary(self):
        user = CustomUser.objects.create_user(
            email="chemistry-member@example.com",
            password="test-password",
            school="Test School",
        )
        self.create_membership(user, subject="chemistry")
        self.client.force_authenticate(user=user)

        response = self.client.get(self.summary_url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_preview"])
        self.assertTrue(response.data["requires_subscription"])

    def test_expired_membership_does_not_unlock_summary(self):
        user = CustomUser.objects.create_user(
            email="expired-summary-member@example.com",
            password="test-password",
            school="Test School",
        )
        membership = self.create_membership(user)
        membership.current_period_end = timezone.now() - timedelta(seconds=1)
        membership.save(update_fields=["current_period_end"])
        self.client.force_authenticate(user=user)

        response = self.client.get(self.summary_url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_preview"])
        self.assertTrue(response.data["requires_subscription"])

    def test_anonymous_user_can_only_request_three_preview_questions(self):
        for preview_index in range(3):
            response = self.client.post(
                self.problems_url,
                {"preview_index": preview_index},
                format="json",
            )
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.data["meta"]["preview"])
            self.assertEqual(response.data["question"]["question_text"], f"Question {preview_index + 1}")

        response = self.client.post(
            self.problems_url,
            {"preview_index": 3},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_curated_preview_uses_configured_order_and_length(self):
        preview_key = ("physics", "motion-and-energy", "projectile-motion")
        preview_ids = [
            self.questions[3].pk,
            self.questions[1].pk,
            self.questions[0].pk,
            self.questions[2].pk,
        ]

        with patch.dict(CURATED_QUESTION_PREVIEWS, {preview_key: preview_ids}):
            for preview_index, expected_id in enumerate(preview_ids):
                response = self.client.post(
                    self.problems_url,
                    {"preview_index": preview_index},
                    format="json",
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data["question"]["question_uid"], expected_id)
                self.assertEqual(response.data["meta"]["preview_limit"], 4)

            response = self.client.post(
                self.problems_url,
                {"preview_index": 4},
                format="json",
            )
            self.assertEqual(response.status_code, 401)

    def test_paid_member_question_request_preserves_seen_tracking(self):
        user = CustomUser.objects.create_user(
            email="member@example.com",
            password="test-password",
            school="Test School",
        )
        self.create_membership(user)
        self.client.force_authenticate(user=user)

        response = self.client.post(self.problems_url, {}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("preview", response.data["meta"])
        self.assertEqual(SeenQuestion.objects.filter(user=user, topic=self.topic).count(), 1)
        engagement = UserSubjectEngagement.objects.get(user=user, subject=self.subject)
        self.assertEqual(engagement.questions_viewed, 1)

    def test_authenticated_unpaid_user_only_receives_question_preview(self):
        user = CustomUser.objects.create_user(
            email="free-question-student@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            self.problems_url,
            {"preview_index": 0},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["meta"]["preview"])
        self.assertTrue(response.data["meta"]["requires_subscription"])
        self.assertFalse(SeenQuestion.objects.filter(user=user).exists())

        response = self.client.post(
            self.problems_url,
            {"preview_index": 3},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "membership_required")

    def test_wrong_subject_membership_cannot_bypass_question_preview(self):
        user = CustomUser.objects.create_user(
            email="wrong-subject-question-member@example.com",
            password="test-password",
            school="Test School",
        )
        self.create_membership(user, subject="biology")
        self.client.force_authenticate(user=user)

        response = self.client.post(
            self.problems_url,
            {"preview_index": 3},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "membership_required")

    def test_expired_membership_cannot_bypass_question_preview(self):
        user = CustomUser.objects.create_user(
            email="expired-question-member@example.com",
            password="test-password",
            school="Test School",
        )
        membership = self.create_membership(user)
        membership.current_period_end = timezone.now() - timedelta(seconds=1)
        membership.save(update_fields=["current_period_end"])
        self.client.force_authenticate(user=user)

        response = self.client.post(
            self.problems_url,
            {"preview_index": 3},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "membership_required")

    def test_paid_member_sac_request_tracks_subject_engagement(self):
        user = CustomUser.objects.create_user(
            email="sac-student@example.com",
            password="test-password",
            school="Test School",
        )
        self.questions[0].difficulty = "Exam-Level"
        self.questions[0].save(update_fields=["difficulty"])
        self.create_membership(user)
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/sac/physics/motion-and-energy/?count=10")

        self.assertEqual(response.status_code, 200)
        engagement = UserSubjectEngagement.objects.get(user=user, subject=self.subject)
        self.assertEqual(engagement.practice_sacs_started, 1)

    def test_authenticated_unpaid_user_cannot_open_practice_sac(self):
        user = CustomUser.objects.create_user(
            email="free-sac-student@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/sac/physics/motion-and-energy/?count=10")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "membership_required")
        self.assertFalse(UserSubjectEngagement.objects.filter(user=user).exists())

    def test_wrong_subject_membership_cannot_open_practice_sac(self):
        user = CustomUser.objects.create_user(
            email="wrong-subject-sac-member@example.com",
            password="test-password",
            school="Test School",
        )
        self.create_membership(user, subject="chemistry")
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/sac/physics/motion-and-energy/?count=10")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "membership_required")

    def test_expired_membership_cannot_open_practice_sac(self):
        user = CustomUser.objects.create_user(
            email="expired-sac-member@example.com",
            password="test-password",
            school="Test School",
        )
        membership = self.create_membership(user)
        membership.current_period_end = timezone.now() - timedelta(seconds=1)
        membership.save(update_fields=["current_period_end"])
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/sac/physics/motion-and-energy/?count=10")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "membership_required")

    def test_anonymous_user_cannot_report_a_question(self):
        response = self.client.post(
            self.report_url,
            {"description": "The object changes halfway through the question."},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertFalse(QuestionIssueReport.objects.exists())

    def test_authenticated_user_can_report_a_question(self):
        user = CustomUser.objects.create_user(
            email="reporter@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            self.report_url,
            {"description": "The object changes from a ball to a car."},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        report = QuestionIssueReport.objects.get()
        self.assertEqual(report.question, self.questions[0])
        self.assertEqual(report.topic, self.topic)
        self.assertEqual(report.reported_by, user)
        self.assertEqual(report.status, QuestionIssueReport.STATUS_OPEN)

    def test_question_report_description_is_required(self):
        user = CustomUser.objects.create_user(
            email="blank-report@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            self.report_url,
            {"description": "   "},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(QuestionIssueReport.objects.exists())


class TutoringInterestTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/tutoring-interest/"
        self.payload = {
            "student_name": "Alex Student",
            "email": "alex@example.com",
            "phone": "0400 000 000",
            "subject": "physics",
            "year_level": "Year 12",
            "preferred_format": "small_group",
            "goals": "Build confidence with fields and prepare for upcoming SACs.",
            "availability": "Tuesday and Thursday after 5 pm",
            "website": "",
        }

    def test_public_user_can_register_tutoring_interest(self):
        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, 201)
        enquiry = TutoringInterest.objects.get()
        self.assertEqual(enquiry.email, "alex@example.com")
        self.assertEqual(enquiry.status, TutoringInterest.STATUS_NEW)
        self.assertIsNone(enquiry.user)
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].to, ["alex@example.com"])

    def test_contact_details_require_a_phone_number(self):
        self.payload["phone"] = ""

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(TutoringInterest.objects.exists())

    def test_signed_in_enquiry_is_linked_to_user(self):
        user = CustomUser.objects.create_user(
            email="member@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(TutoringInterest.objects.get().user, user)
