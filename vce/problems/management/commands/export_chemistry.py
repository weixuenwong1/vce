# problems/management/commands/export_chemistry.py

from django.core.management.base import BaseCommand
from contents.models import Subject, Chapter, Topic
from problems.models import Question, Order, Solution
import json

class Command(BaseCommand):
    help = 'Export Chemistry questions, orders, and solutions'

    def handle(self, *args, **kwargs):
        chemistry_subject = Subject.objects.filter(name__iexact='chemistry').first()
        if not chemistry_subject:
            self.stdout.write(self.style.ERROR("Chemistry subject not found."))
            return

        chapters = Chapter.objects.filter(subject=chemistry_subject)
        topics = Topic.objects.filter(chapter__in=chapters)
        topic_ids = list(topics.values_list('id', flat=True))

        # Get all Questions linked to any Chemistry topic
        questions = Question.objects.filter(topic__in=topics).distinct()
        question_ids = list(questions.values_list('question_uid', flat=True))

        # Build list of topic mappings for M2M
        question_topic_map = []
        for question in questions:
            for topic in question.topic.all():
                question_topic_map.append({
                    "question_uid": question.question_uid,
                    "topic_id": topic.id
                })

        orders = Order.objects.filter(question_id__in=question_ids)
        order_ids = list(orders.values_list('order_uid', flat=True))

        solutions = Solution.objects.filter(order_id__in=order_ids)

        # Output structured data
        data = {
            "subjects": list(Subject.objects.filter(id=chemistry_subject.id).values()),
            "chapters": list(chapters.values()),
            "topics": list(topics.values()),
            "questions": list(questions.values()),
            "question_topic_map": question_topic_map,
            "orders": list(orders.values()),
            "solutions": list(solutions.values()),
        }

        with open("chemistry_export.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        self.stdout.write(self.style.SUCCESS("✅ Exported Chemistry questions and sub-content."))
