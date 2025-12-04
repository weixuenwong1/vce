import json
from django.core.management.base import BaseCommand, CommandError
from contents.models import Topic
from problems.models import Question, Order, Solution


class Command(BaseCommand):
    help = "Import/update questions + orders + solutions for a Topic from an export JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "topic_id",
            type=int,
            help="Topic ID (topic_uid) to attach questions to",
        )
        parser.add_argument(
            "json_path",
            type=str,
            help="Path to JSON file created by export_medicinal_chem",
        )

    def handle(self, *args, **options):
        topic_id = options["topic_id"]
        json_path = options["json_path"]

        # 1) Resolve Topic
        try:
            topic = Topic.objects.get(pk=topic_id)
        except Topic.DoesNotExist:
            raise CommandError(f"Topic with id={topic_id} not found on this DB")

        # 2) Load JSON
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError:
            raise CommandError(f"File not found: {json_path}")

        imported = 0

        for q_data in data.get("questions", []):
            q_uuid = q_data.get("question_uuid")
            q_uid = q_data.get("question_uid")

            if not q_uuid and not q_uid:
                self.stderr.write("Skipping question with no uuid/uid")
                continue

            # Prefer UUID as stable cross-DB ID, fallback to question_uid
            lookup = {"uuid": q_uuid} if q_uuid else {"question_uid": q_uid}

            # 3) Create or update the Question
            question, created = Question.objects.update_or_create(
                **lookup,
                defaults={
                    "question_text": q_data["question_text"],
                    "difficulty": q_data["difficulty"],
                    "multiple_choice": q_data["multiple_choice"],
                },
            )

            # Ensure M2M link to this Topic
            question.topic.add(topic)

            # 4) Wipe existing Orders & Solutions for this question on this DB
            Order.objects.filter(question_id=question).delete()
            Solution.objects.filter(question_id=question).delete()

            # 5) Recreate Orders first, keep a map by UUID so Solutions can link to them
            order_by_uuid = {}
            for o in q_data.get("orders", []):
                order = Order.objects.create(
                    question_id=question,
                    content_type=o["content_type"],
                    text_content=o.get("text_content"),
                    section_order=o.get("section_order"),
                )

                image_path = o.get("image_content")
                if image_path:
                    order.image_content.name = image_path
                    order.save(update_fields=["image_content"])

                if o.get("order_uuid"):
                    order_by_uuid[o["order_uuid"]] = order

            # 6) Recreate Solutions and attach to Orders if we can
            for s in q_data.get("solutions", []):
                order = None
                order_uuid = s.get("order_uuid")
                if order_uuid:
                    order = order_by_uuid.get(order_uuid)

                solution = Solution.objects.create(
                    question_id=question,
                    order_id=order,
                    solution_text=s["solution_text"],
                )

                image_path = s.get("solution_image")
                if image_path:
                    solution.solution_image.name = image_path
                    solution.save(update_fields=["solution_image"])

            imported += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported/updated {imported} questions for Topic {topic_id}"
            )
        )
