import json
from django.core.management.base import BaseCommand, CommandError
from contents.models import Topic
from problems.models import Question, Order, Solution


class Command(BaseCommand):
    help = "Export all questions/orders/solutions for a given Topic ID to JSON."
    
    def add_arguments(self, parser):
        parser.add_argument(
            "topic_id",
            type=int,
            help="Topic ID (topic_uid) to export questions for",
        )
        parser.add_argument(
            "--output",
            type=str,
            default=None,
            help="Output JSON file path",
        )

    def handle(self, *args, **options):
        topic_id = options["topic_id"]
        output_path = options["output"] or f"topic_{topic_id}_questions.json"

        try:
            topic = Topic.objects.get(pk=topic_id)
        except Topic.DoesNotExist:
            raise CommandError(f"Topic with id={topic_id} not found")

        questions = (
            Question.objects.filter(topic=topic)
            .prefetch_related("order", "solution")
            .order_by("question_uid")
        )

        data = {
            "topic_id": topic_id,
            "topic_name": topic.topic_name,
            "questions": [],
        }

        for q in questions:
            q_dict = {
                "question_uuid": str(q.uuid) if q.uuid else None,
                "question_uid": q.question_uid,
                "question_text": q.question_text,
                "difficulty": q.difficulty,
                "multiple_choice": q.multiple_choice,
                "orders": [],
                "solutions": [],
            }

            # Orders (related_name="order")
            for o in q.order.all().order_by("section_order", "order_uid"):
                q_dict["orders"].append(
                    {
                        "order_uuid": str(o.uuid) if o.uuid else None,
                        "order_uid": o.order_uid,
                        "section_order": o.section_order,
                        "content_type": o.content_type,  # "TEXT" / "IMAGE"
                        "text_content": o.text_content,
                        "image_content": o.image_content.name if o.image_content else None,
                    }
                )

            # Solutions (related_name="solution")
            for s in q.solution.all().order_by("solution_uid"):
                q_dict["solutions"].append(
                    {
                        "solution_uuid": str(s.uuid) if s.uuid else None,
                        "solution_uid": s.solution_uid,
                        "solution_text": s.solution_text,
                        "solution_image": s.solution_image.name if s.solution_image else None,
                        "order_uuid": (
                            str(s.order_id.uuid) if s.order_id and s.order_id.uuid else None
                        ),
                    }
                )

            data["questions"].append(q_dict)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        self.stdout.write(
            self.style.SUCCESS(
                f"Exported {len(data['questions'])} questions for Topic {topic_id} to {output_path}"
            )
        )
