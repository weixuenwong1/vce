from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.generics import  ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from rest_framework.response import Response
import random

from .serializers import (
    QuestionSerializer,  
    ChapterSerializer, 
    TopicSerializer, 
    TopicSummarySerializer, 
    QuestionSubmissionSerializer, 
    SubjectSerializer
)
from problems.models import Question, SeenQuestion
from contents.models import Subject, Chapter, Topic
from submission.models import QuestionSubmission


from django.db import transaction


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
    def get(self, request, *args, **kwargs):
        subject = kwargs.get('subject')
        chapter_slug = kwargs.get('chapter_slug')
        topic_slug = kwargs.get('topic_slug')

        chapter = get_object_or_404(Chapter, slug=chapter_slug, subject__name__iexact=subject)
        topic = get_object_or_404(Topic, chapter=chapter, slug=topic_slug)
        serializer = TopicSummarySerializer(topic)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ------------------------
# QUESTION FETCHING
# ------------------------


class NextQuestionView(APIView):
    """
    POST: Fetch the next unseen question for a user in a given topic.
    - Keeps track of which questions the user has already seen.
    - Resets seen list once all questions are exhausted.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, subject, chapter_slug, topic_slug):
        user = request.user
        chapter = get_object_or_404(
            Chapter, slug=chapter_slug, subject__name__iexact=subject
        )
        topic = get_object_or_404(Topic, chapter=chapter, slug=topic_slug)

        all_qs = Question.objects.filter(topic=topic).order_by('pk')
        total = all_qs.count()
        if total == 0:
            return Response({"detail": "No questions in this topic."}, status=404)


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
        return Response(serializer.data, status=status.HTTP_200_OK)


# ------------------------
# QUESTION SUBMISSION INBOX
# ------------------------


class QuestionSubmissionListCreateView(generics.ListCreateAPIView):
    """
    POST /api/inbox/submissions/
      body: {
        "subject": <subject_id:int>,
        "chapter": "<chapter_slug:str>",
        "topic": <topic_id:int>,
        "question_text": "..."
      }

    GET  /api/inbox/submissions/?subject=<id>&chapter=<id_or_slug>&topic=<id>
      - chapter accepts either the numeric chapter id or the slug
    """
    serializer_class = QuestionSubmissionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = (
            QuestionSubmission.objects
            .select_related('subject', 'chapter', 'topic')
            .order_by('-created_at')
        )
        s = self.request.query_params.get("subject")
        c = self.request.query_params.get("chapter")  
        t = self.request.query_params.get("topic")

        if s:
            qs = qs.filter(subject_id=s)

        if c:
            try:
                qs = qs.filter(chapter_id=int(c))
            except (TypeError, ValueError):
                qs = qs.filter(chapter__slug=c)

        if t:
            qs = qs.filter(topic_id=t)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)