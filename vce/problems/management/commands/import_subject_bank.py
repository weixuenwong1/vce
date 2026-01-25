import json
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from contents.models import Subject, Chapter, Topic
from problems.models import Question, Order, Solution


class Command(BaseCommand):
    help = "Import subject bank JSON in add-only mode (skip existing; do not update)."

    def add_arguments(self, parser):
        parser.add_argument("fixture_path", type=str)
        parser.add_argument(
            "--set-images",
            action="store_true",
            help="Set ImageField names from JSON (ONLY if files already exist in prod S3 with same keys).",
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        path = opts["fixture_path"]
        set_images = opts["set_images"]

        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError as e:
            raise CommandError(f"File not found: {path}") from e

        subject_name = data.get("subject_name")
        if not subject_name:
            raise CommandError("Missing 'subject_name' in fixture.")

        # We assume subject already exists in prod (safer)
        try:
            subject = Subject.objects.get(name__iexact=subject_name)
        except Subject.DoesNotExist as e:
            raise CommandError(f"Subject not found in prod: {subject_name}. Create it first.") from e

        # ---------------------------
        # 1) Chapters (by slug unique)
        # ---------------------------
        chapter_by_slug = {}
        created_ch = skipped_ch = 0

        for ch in data.get("chapters", []):
            slug = ch.get("chapter_slug")
            if not slug:
                raise CommandError("A chapter is missing chapter_slug.")

            existing = Chapter.objects.filter(slug=slug).first()
            if existing:
                # add-only: don't update name/description
                if existing.subject_id != subject.id:
                    raise CommandError(
                        f"Chapter slug '{slug}' exists but belongs to a different subject in prod. Aborting."
                    )
                chapter_by_slug[slug] = existing
                skipped_ch += 1
                continue

            chapter = Chapter.objects.create(
                slug=slug,
                chapter_name=ch.get("chapter_name", ""),
                chapter_description=ch.get("chapter_description", ""),
                subject=subject,
            )
            chapter_by_slug[slug] = chapter
            created_ch += 1

        # ---------------------------
        # 2) Topics (by slug unique)
        # ---------------------------
        topic_by_slug = {}
        created_t = skipped_t = 0

        for t in data.get("topics", []):
            t_slug = t.get("topic_slug")
            ch_slug = t.get("chapter_slug")
            if not t_slug or not ch_slug:
                raise CommandError("A topic is missing topic_slug or chapter_slug.")

            chapter = chapter_by_slug.get(ch_slug)
            if not chapter:
                raise CommandError(f"Topic references unknown chapter_slug='{ch_slug}'.")

            existing = Topic.objects.filter(slug=t_slug).first()
            if existing:
                # add-only: refuse if it points to a different chapter
                if existing.chapter_id != chapter.chapter_uid:
                    raise CommandError(
                        f"Topic slug '{t_slug}' already exists under a different chapter in prod. Aborting."
                    )
                topic_by_slug[t_slug] = existing
                skipped_t += 1
                continue

            topic = Topic.objects.create(
                slug=t_slug,
                chapter=chapter,
                topic_name=t.get("topic_name", ""),
                content=t.get("topic_content"),
            )
            topic_by_slug[t_slug] = topic
            created_t += 1

        # ---------------------------
        # 3) Questions/Orders/Solutions (UUID add-only)
        # ---------------------------
        created_q = skipped_q = 0
        created_o = skipped_o = 0
        created_s = skipped_s = 0

        for q in data.get("questions", []):
            q_uuid = q.get("question_uuid")
            if not q_uuid:
                raise CommandError("A question is missing question_uuid.")

            # If question already exists, strict add-only: skip everything under it
            if Question.objects.filter(uuid=q_uuid).exists():
                skipped_q += 1
                continue

            question = Question.objects.create(
                uuid=q_uuid,
                question_text=q.get("question_text", ""),
                difficulty=q.get("difficulty", ""),
                multiple_choice=q.get("multiple_choice", False),
            )
            created_q += 1

            # M2M link to topics
            topic_slugs = q.get("topic_slugs", [])
            if not topic_slugs:
                raise CommandError(f"Question {q_uuid} has no topic_slugs in fixture (cannot link M2M).")

            for t_slug in topic_slugs:
                topic = topic_by_slug.get(t_slug)
                if not topic:
                    raise CommandError(f"Question {q_uuid} references unknown topic_slug='{t_slug}'.")
                question.topic.add(topic)

            # Orders (map uuid -> object for linking solutions)
            order_by_uuid = {}

            for o in q.get("orders", []):
                o_uuid = o.get("order_uuid")
                if not o_uuid:
                    raise CommandError(f"Order missing order_uuid (question {q_uuid}).")

                existing_o = Order.objects.filter(uuid=o_uuid).first()
                if existing_o:
                    skipped_o += 1
                    order_by_uuid[o_uuid] = existing_o
                    continue

                order = Order.objects.create(
                    uuid=o_uuid,
                    question_id=question,
                    content_type=o.get("content_type"),
                    text_content=o.get("text_content"),
                    section_order=o.get("section_order"),
                )

                # Only set file name if you KNOW file exists in prod S3
                if set_images and o.get("image_content"):
                    order.image_content.name = o["image_content"]
                    order.save(update_fields=["image_content"])

                created_o += 1
                order_by_uuid[o_uuid] = order

            # Solutions
            for s in q.get("solutions", []):
                s_uuid = s.get("solution_uuid")
                if not s_uuid:
                    raise CommandError(f"Solution missing solution_uuid (question {q_uuid}).")

                if Solution.objects.filter(uuid=s_uuid).exists():
                    skipped_s += 1
                    continue

                link_order = None
                link_order_uuid = s.get("order_uuid")
                if link_order_uuid:
                    link_order = order_by_uuid.get(link_order_uuid)

                sol = Solution.objects.create(
                    uuid=s_uuid,
                    question_id=question,
                    order_id=link_order,
                    solution_text=s.get("solution_text", ""),
                )

                if set_images and s.get("solution_image"):
                    sol.solution_image.name = s["solution_image"]
                    sol.save(update_fields=["solution_image"])

                created_s += 1

        self.stdout.write(self.style.SUCCESS("Import complete (add-only)."))
        self.stdout.write(f"Subject: {subject.name}")
        self.stdout.write(f"Chapters: created={created_ch}, skipped={skipped_ch}")
        self.stdout.write(f"Topics:   created={created_t}, skipped={skipped_t}")
        self.stdout.write(f"Questions: created={created_q}, skipped={skipped_q}")
        self.stdout.write(f"Orders:    created={created_o}, skipped={skipped_o}")
        self.stdout.write(f"Solutions: created={created_s}, skipped={skipped_s}")
