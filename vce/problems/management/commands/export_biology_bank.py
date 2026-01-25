import json
from django.core.management.base import BaseCommand, CommandError

from contents.models import Subject, Chapter, Topic
from problems.models import Question


class Command(BaseCommand):
    help = "Export ALL chapters/topics and their questions/orders/solutions for a subject to JSON."

    def add_arguments(self, parser):
        parser.add_argument("--subject-name", required=True, help="e.g. Biology")
        parser.add_argument("--output", required=True, help="e.g. fixtures/biology_2026jan.json")

    def handle(self, *args, **opts):
        subject_name = opts["subject_name"]
        output_path = opts["output"]

        try:
            subject = Subject.objects.get(name__iexact=subject_name)
        except Subject.DoesNotExist:
            raise CommandError(f"Subject not found: {subject_name}")

        chapters = Chapter.objects.filter(subject=subject).order_by("chapter_uid")
        topics = Topic.objects.filter(chapter__in=chapters).select_related("chapter").order_by("topic_uid")

        # Questions that are linked (M2M) to any of these topics
        questions = (
            Question.objects.filter(topic__in=topics)
            .prefetch_related("order", "solution", "topic")
            .distinct()
            .order_by("question_uid")
        )

        topic_slugs_in_export = set(topics.values_list("slug", flat=True))

        data = {
            "subject_name": subject.name,
            "chapters": [
                {
                    "chapter_slug": ch.slug,
                    "chapter_name": ch.chapter_name,
                    "chapter_description": ch.chapter_description,
                }
                for ch in chapters
            ],
            "topics": [
                {
                    "topic_slug": t.slug,
                    "topic_name": t.topic_name,
                    "topic_content": t.content,
                    "chapter_slug": t.chapter.slug,
                }
                for t in topics
            ],
            "questions": [],
        }

        for q in questions:
            q_topic_slugs = [t.slug for t in q.topic.all() if t.slug in topic_slugs_in_export]

            q_dict = {
                "question_uuid": str(q.uuid) if q.uuid else None,
                "question_text": q.question_text,
                "difficulty": q.difficulty,
                "multiple_choice": q.multiple_choice,
                "topic_slugs": q_topic_slugs,
                "orders": [],
                "solutions": [],
            }

            for o in q.order.all().order_by("section_order", "order_uid"):
                q_dict["orders"].append(
                    {
                        "order_uuid": str(o.uuid) if o.uuid else None,
                        "content_type": o.content_type,
                        "text_content": o.text_content,
                        "image_content": o.image_content.name if o.image_content else None,
                        "section_order": o.section_order,
                    }
                )

            for s in q.solution.all().order_by("solution_uid"):
                q_dict["solutions"].append(
                    {
                        "solution_uuid": str(s.uuid) if s.uuid else None,
                        "solution_text": s.solution_text,
                        "solution_image": s.solution_image.name if s.solution_image else None,
                        "order_uuid": str(s.order_id.uuid) if s.order_id and s.order_id.uuid else None,
                    }
                )

            data["questions"].append(q_dict)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        self.stdout.write(self.style.SUCCESS(
            f"Exported '{subject.name}': "
            f"{len(data['chapters'])} chapters, {len(data['topics'])} topics, {len(data['questions'])} questions -> {output_path}"
        ))
