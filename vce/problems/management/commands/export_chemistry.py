from django.core.management.base import BaseCommand
from contents.models import Subject, Chapter, Topic
from problems.models import Question, Order, Solution
import json

class Command(BaseCommand):
    help = 'Export Chemistry data for specific chapters, using UUIDs for Questions/Orders/Solutions'

    def handle(self, *args, **kwargs):
        output = []

        # Get Chemistry subject
        chemistry = Subject.objects.filter(name__iexact='chemistry').first()
        if not chemistry:
            self.stdout.write(self.style.ERROR("Chemistry subject not found"))
            return

        output.append({
            "model": "contents.subject",
            "pk": chemistry.pk,
            "fields": {
                "name": chemistry.name,
            }
        })

        # Filter specific chapters only
        target_chapter_names = [
            "Fundamentals of Organic Compounds",
            "Analysis and Applications of Organic Compounds"
        ]

        chapters = Chapter.objects.filter(subject=chemistry, chapter_name__in=target_chapter_names)
        for chapter in chapters:
            output.append({
                "model": "contents.chapter",
                "pk": chapter.pk,
                "fields": {
                    "chapter_name": chapter.chapter_name,
                    "subject": chemistry.pk
                }
            })

        topics = Topic.objects.filter(chapter__in=chapters)
        for topic in topics:
            output.append({
                "model": "contents.topic",
                "pk": topic.pk,
                "fields": {
                    "topic_name": topic.topic_name,
                    "chapter": topic.chapter_id
                }
            })

        # Questions linked to those topics
        questions = Question.objects.filter(topic__in=topics).distinct()
        for q in questions:
            output.append({
                "model": "problems.question",
                "pk": str(q.uuid),
                "fields": {
                    "uuid": str(q.uuid),
                    "question_text": q.question_text,
                    "difficulty": q.difficulty,
                    "created_at": q.created_at.isoformat() if q.created_at else None
                }
            })

        # M2M: Question <-> Topic
        for q in questions:
            for t in q.topic.all():
                output.append({
                    "model": "problems.question_topic",
                    "pk": None,
                    "fields": {
                        "question": str(q.uuid),
                        "topic": t.pk
                    }
                })

        # Orders
        orders = Order.objects.filter(question_id__in=questions)
        for o in orders:
            output.append({
                "model": "problems.order",
                "pk": str(o.uuid),
                "fields": {
                    "uuid": str(o.uuid),
                    "question_id": str(o.question_id.uuid) if o.question_id else None,
                    "content_type": o.content_type,
                    "text_content": o.text_content,
                    "image_content": o.image_content.name if o.image_content else "",
                    "section_order": o.section_order
                }
            })

        # Solutions
        solutions = Solution.objects.filter(question_id__in=questions)
        for s in solutions:
            output.append({
                "model": "problems.solution",
                "pk": str(s.uuid),
                "fields": {
                    "uuid": str(s.uuid),
                    "question_id": str(s.question_id.uuid) if s.question_id else None,
                    "order_id": str(s.order_id.uuid) if s.order_id else None,
                    "solution_text": s.solution_text,
                    "solution_image": s.solution_image.name if s.solution_image else ""
                }
            })

        # Save to file
        with open("chemistry_selected_export.json", "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        self.stdout.write(self.style.SUCCESS("✅ Export complete: chemistry_selected_export.json"))
