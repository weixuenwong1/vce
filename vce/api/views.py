from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import  ListAPIView
from django.shortcuts import get_object_or_404

from rest_framework.response import Response
import random

from .serializers import (
    QuestionSerializer,  
    ChapterSerializer, 
    TopicSerializer, 
    TopicSummarySerializer, 
    SubjectSerializer,
    ChapterCatalogueSerializer,
)
from problems.models import Question, QuestionIssueReport, SeenQuestion
from contents.models import Subject, Chapter, Topic
from accounts.engagement import record_engagement


from django.db import transaction


SUMMARY_PREVIEW_CHARACTERS = 1600
QUESTION_PREVIEW_LIMIT = 3
CURATED_QUESTION_PREVIEWS = {
    ("physics", "motion-and-energy", "newton-s-laws-of-motion"): [2, 84, 73, 9],
    ("physics", "motion-and-energy", "graphical-analysis-of-motion"): [554, 553],
    ("physics", "motion-and-energy", "projectile-motion"): [26, 46, 40],
    ("physics", "motion-and-energy", "uniform-circular-motion"): [107, 98, 95],
    ("physics", "motion-and-energy", "non-uniform-circular-motion"): [133, 136, 142],
    ("physics", "motion-and-energy", "momentum-and-impulse"): [109, 130, 125],
    ("physics", "motion-and-energy", "energy"): [86, 167, 149],
    ("physics", "fields", "newton-s-universal-law-of-gravitation"): [189, 173, 374],
    ("physics", "fields", "motion-and-energy-changes-in-gravitational-fields"): [193, 196],
    ("physics", "fields", "the-electric-field-model-and-coulomb-s-law"): [207, 205, 213],
    ("physics", "fields", "uniform-electric-fields"): [223, 238, 243],
    ("physics", "fields", "magnetic-fields-and-right-hand-rules"): [248, 254, 265, 277],
    ("physics", "fields", "magnetic-forces"): [287, 306, 299],
    ("physics", "electricity", "ways-of-generating-emf"): [324, 320, 332],
    ("physics", "electricity", "generators-and-alternators"): [353, 342, 343],
    ("physics", "electricity", "transformers-and-power-distribution"): [396, 401, 404],
    ("physics", "waves-and-particles", "light-as-a-wave-and-wave-phenomena"): [460, 429, 433],
    ("physics", "waves-and-particles", "light-as-a-particle-and-photoelectric-effect"): [472, 494, 480],
    ("physics", "waves-and-particles", "similarities-between-light-and-matter"): [546, 513, 517],
    ("physics", "einsteins-special-relativity", "special-relativity"): [574, 593, 561],
    ("physics", "einsteins-special-relativity", "einstein-s-relationship-between-mass-and-energy"): [580, 585, 581],
}


def question_preview(subject, chapter_slug, topic_slug, questions):
    """Return curated preview questions in order, with a safe default fallback."""
    preview_ids = CURATED_QUESTION_PREVIEWS.get(
        (subject.casefold(), chapter_slug, topic_slug)
    )
    if not preview_ids:
        return list(questions[:QUESTION_PREVIEW_LIMIT])

    questions_by_id = {
        question.pk: question for question in questions.filter(pk__in=preview_ids)
    }
    curated_questions = [
        questions_by_id[question_id]
        for question_id in preview_ids
        if question_id in questions_by_id
    ]
    return curated_questions or list(questions[:QUESTION_PREVIEW_LIMIT])


def summary_preview(content):
    """Return a readable Markdown excerpt without cutting a paragraph in half."""
    content = content or ""
    if len(content) <= SUMMARY_PREVIEW_CHARACTERS:
        return content, False

    boundary = content.rfind("\n\n", 800, SUMMARY_PREVIEW_CHARACTERS)
    if boundary == -1:
        boundary = SUMMARY_PREVIEW_CHARACTERS
    return content[:boundary].rstrip(), True


# ------------------------
# SUBJECT & CHAPTER VIEWS
# ------------------------

class SubjectListView(ListAPIView):
    """GET: List all subjects, ordered alphabetically."""
    queryset = Subject.objects.all().order_by("name")
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]

class ChapterListView(generics.ListAPIView):
    """GET: List all chapters (unsorted)."""
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer


class ResourceCatalogueView(APIView):
    """Return one subject's chapters and topics in a single request."""
    permission_classes = [AllowAny]

    def get(self, request, subject):
        chapters = (
            Chapter.objects
            .filter(subject__name__iexact=subject)
            .prefetch_related('topics')
        )
        response = Response(ChapterCatalogueSerializer(chapters, many=True).data)
        response['Cache-Control'] = 'public, max-age=300, stale-while-revalidate=86400'
        return response


class TopicsByChapterSlugView(generics.ListAPIView):
    """GET: List all topics for a given chapter slug."""
    serializer_class = TopicSerializer

    def get_queryset(self):
        return Topic.objects.filter(chapter__slug=self.kwargs['slug'])


class ChapterBySlugView(APIView):
    """GET: Retrieve a chapter name by its slug."""
    def get(self, request, slug):
        chapter = get_object_or_404(Chapter, slug=slug)
        return Response({
            "chapter_name": chapter.chapter_name
        })
    
class SubjectChaptersView(APIView):
    """GET: Retrieve all chapters belonging to a subject (by subject_id)."""
    def get(self, request, subject_id):
        qs = Chapter.objects.filter(subject_id=subject_id).order_by("chapter_name")
        data = ChapterSerializer(qs, many=True).data
        return Response(data)

# ------------------------
# TOPIC SUMMARIES
# ------------------------


class TopicSummaryView(APIView):
    """GET: Retrieve the summary for a specific topic inside a chapter."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        subject = kwargs.get('subject')
        chapter_slug = kwargs.get('chapter_slug')
        topic_slug = kwargs.get('topic_slug')

        chapter = get_object_or_404(Chapter, slug=chapter_slug, subject__name__iexact=subject)
        topic = get_object_or_404(Topic, chapter=chapter, slug=topic_slug)
        data = dict(TopicSummarySerializer(topic).data)

        if not request.user.is_authenticated:
            data["content"], data["is_preview"] = summary_preview(data.get("content"))
        else:
            data["is_preview"] = False
            record_engagement(request.user, chapter.subject, "summaries_viewed")

        return Response(data, status=status.HTTP_200_OK)


# ------------------------
# QUESTION FETCHING
# ------------------------


class NextQuestionView(APIView):
    """
    POST: Fetch the next unseen question for a user in a given topic.
    - Keeps track of which questions the user has already seen.
    - Resets seen list once all questions are exhausted.
    """

    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, subject, chapter_slug, topic_slug):
        chapter = get_object_or_404(
            Chapter, slug=chapter_slug, subject__name__iexact=subject
        )
        topic = get_object_or_404(Topic, chapter=chapter, slug=topic_slug)

        all_qs = Question.objects.filter(topic=topic).distinct().order_by('pk')
        total = all_qs.count()
        if total == 0:
            return Response({"detail": "No questions in this topic."}, status=404)

        if not request.user.is_authenticated:
            try:
                preview_index = int(request.data.get("preview_index", 0))
            except (TypeError, ValueError):
                preview_index = 0

            preview_questions = question_preview(
                subject,
                chapter.slug,
                topic.slug,
                all_qs,
            )
            preview_limit = len(preview_questions)
            if preview_index < 0 or preview_index >= preview_limit:
                return Response(
                    {"detail": "Sign in to continue with more questions."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            question = preview_questions[preview_index]
            return Response(
                {
                    "question": QuestionSerializer(question).data,
                    "meta": {
                        "topic": topic.slug,
                        "topic_id": topic.pk,
                        "preview": True,
                        "preview_index": preview_index,
                        "preview_limit": preview_limit,
                        "total_available": total,
                    },
                },
                status=status.HTTP_200_OK,
            )

        user = request.user


        seen_pks = set(
            SeenQuestion.objects
                .filter(user=user, topic=topic)
                .values_list('question_id', flat=True)  
        )

        unseen_qs = all_qs.exclude(pk__in=seen_pks)

        if not unseen_qs.exists():
            SeenQuestion.objects.filter(user=user, topic=topic).delete()
            unseen_qs = all_qs

        count = unseen_qs.count()
        idx = random.randrange(count)
        q = unseen_qs[idx:idx+1].first()


        SeenQuestion.objects.get_or_create(user=user, topic=topic, question=q)
        record_engagement(user, chapter.subject, "questions_viewed")

        data = QuestionSerializer(q).data  
        return Response(
            {
                "question": data,
                "meta": {
                    "topic": topic.slug,
                    "topic_id": topic.pk,
                    "seen": len(seen_pks),
                    "unseen": count,
                    "total_available": total, 
                },
            },
            status=status.HTTP_200_OK,
        )


class QuestionIssueReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, subject, chapter_slug, topic_slug, question_id):
        chapter = get_object_or_404(
            Chapter,
            slug=chapter_slug,
            subject__name__iexact=subject,
        )
        topic = get_object_or_404(Topic, chapter=chapter, slug=topic_slug)
        question = get_object_or_404(
            Question.objects.filter(topic=topic).distinct(),
            pk=question_id,
        )
        description = str(request.data.get("description", "")).strip()

        if not description:
            return Response(
                {"description": ["Please describe what seems wrong with the question."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(description) > 1500:
            return Response(
                {"description": ["Please keep the report under 1,500 characters."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = QuestionIssueReport.objects.create(
            question=question,
            topic=topic,
            reported_by=request.user,
            description=description,
        )
        return Response(
            {
                "id": report.pk,
                "message": "Thanks. We'll review this question.",
            },
            status=status.HTTP_201_CREATED,
        )


class ResetSeenQuestionsView(APIView):
    """
    DELETE: Reset (clear) all seen questions for a user in a given topic.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)  
        deleted, _ = SeenQuestion.objects.filter(user=request.user, topic=topic).delete()
        return Response({"message": "Seen questions reset.", "deleted": deleted}, status=status.HTTP_200_OK)


# ------------------------
# RANDOM SAC GENERATION
# ------------------------

class RandomSACQuestionsView(APIView):
    """
    GET: Generate a set of random SAC-style questions for a given chapter.
    - Chemistry: 7 MCQ + 6 SA (Exam-Level).
    - Physics: 10 SA (default).
    - Other subjects: evenly distributed across topics.
    """
    def get(self, request, subject, chapter_slug):
        chapter = get_object_or_404(
            Chapter, subject__name__iexact=subject, slug=chapter_slug
        )

        topics = Topic.objects.filter(chapter=chapter)
        if not topics.exists():
            return Response({"error": "No topics found for this chapter"},
                            status=status.HTTP_404_NOT_FOUND)

        subject_lc = (subject or "").strip().lower()

        if subject_lc == "chemistry":
            target_mcq, target_sa = 7, 4

        elif subject_lc == "biology":
            target_mcq, target_sa = 7, 6

        if subject_lc in {"chemistry", "biology"}:
            total_needed = target_mcq + target_sa

            mcq_qs = (
                Question.objects
                .filter(topic__in=topics, multiple_choice=True)
                .distinct()
            )
            sa_qs = (
                Question.objects
                .filter(topic__in=topics, difficulty="Exam-Level", multiple_choice=False)
                .distinct()
            )

            mcq_selected = random.sample(list(mcq_qs), min(target_mcq, mcq_qs.count()))
            sa_selected  = random.sample(list(sa_qs),  min(target_sa,  sa_qs.count()))

            current = len(mcq_selected) + len(sa_selected)
            if current < total_needed:
                already_pks = {q.pk for q in mcq_selected} | {q.pk for q in sa_selected}
                remaining_pool = list(
                    (mcq_qs | sa_qs).exclude(pk__in=already_pks).distinct()
                )
                need = min(total_needed - current, len(remaining_pool))
                for q in random.sample(remaining_pool, need):
                    (mcq_selected if q.multiple_choice else sa_selected).append(q)

            random.shuffle(mcq_selected)
            random.shuffle(sa_selected)
            final_questions = mcq_selected + sa_selected

            serializer = QuestionSerializer(final_questions, many=True)
            record_engagement(request.user, chapter.subject, "practice_sacs_started")
            return Response(serializer.data, status=status.HTTP_200_OK)

        if subject_lc == "physics":
            total_sa = int(request.GET.get("count", 10))
            sa_pool = (
                Question.objects
                .filter(topic__in=topics, difficulty="Exam-Level", multiple_choice=False)
                .distinct()
            )
            final_questions = random.sample(list(sa_pool), min(total_sa, sa_pool.count()))
            serializer = QuestionSerializer(final_questions, many=True)
            record_engagement(request.user, chapter.subject, "practice_sacs_started")
            return Response(serializer.data, status=status.HTTP_200_OK)

        total_questions = int(request.GET.get('count', 10))
        questions_per_topic = max(1, total_questions // topics.count())
        collected_questions = []

        for topic in topics:
            topic_questions = list(
                Question.objects.filter(topic=topic, difficulty='Exam-Level').distinct()
            )
            if topic_questions:
                collected_questions.extend(
                    random.sample(topic_questions, min(questions_per_topic, len(topic_questions)))
                )

        if len(collected_questions) < total_questions:
            already_pks = [q.pk for q in collected_questions]
            fallback_pool = (
                Question.objects
                .filter(topic__in=topics, difficulty='Exam-Level')
                .exclude(pk__in=already_pks)
                .distinct()
            )
            need = min(total_questions - len(collected_questions), fallback_pool.count())
            collected_questions.extend(random.sample(list(fallback_pool), need))

        random.shuffle(collected_questions)
        final_questions = collected_questions[:total_questions]

        serializer = QuestionSerializer(final_questions, many=True)
        record_engagement(request.user, chapter.subject, "practice_sacs_started")
        return Response(serializer.data, status=status.HTTP_200_OK)
