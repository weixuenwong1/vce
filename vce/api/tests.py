from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser
from contents.models import Chapter, Subject, Topic
from problems.models import Question, SeenQuestion


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
        self.catalogue_url = "/api/catalogue/physics/"

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

    def test_authenticated_summary_is_complete(self):
        user = CustomUser.objects.create_user(
            email="student@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.get(self.summary_url)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_preview"])
        self.assertEqual(response.data["content"], self.topic.content)

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

    def test_authenticated_question_request_preserves_seen_tracking(self):
        user = CustomUser.objects.create_user(
            email="member@example.com",
            password="test-password",
            school="Test School",
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(self.problems_url, {}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("preview", response.data["meta"])
        self.assertEqual(SeenQuestion.objects.filter(user=user, topic=self.topic).count(), 1)
