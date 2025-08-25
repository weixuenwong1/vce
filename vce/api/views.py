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


from django.db import IntegrityError, transaction


class SubjectListView(ListAPIView):
    queryset = Subject.objects.all().order_by("name")
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]

class ChapterListView(generics.ListAPIView):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer


class TopicsByChapterSlugView(generics.ListAPIView):
    serializer_class = TopicSerializer

    def get_queryset(self):
        return Topic.objects.filter(chapter__slug=self.kwargs['slug'])


class ChapterBySlugView(APIView):
    def get(self, request, slug):
        chapter = get_object_or_404(Chapter, slug=slug)
        return Response({
            "chapter_name": chapter.chapter_name
        })
    
class SubjectChaptersView(APIView):
    def get(self, request, subject_id):
        qs = Chapter.objects.filter(subject_id=subject_id).order_by("chapter_name")
        data = ChapterSerializer(qs, many=True).data
        return Response(data)


class TopicSummaryView(APIView):
    def get(self, request, *args, **kwargs):
        subject = kwargs.get('subject')
        chapter_slug = kwargs.get('chapter_slug')
        topic_slug = kwargs.get('topic_slug')

        chapter = get_object_or_404(Chapter, slug=chapter_slug, subject__name__iexact=subject)
        topic = get_object_or_404(Topic, chapter=chapter, slug=topic_slug)
        serializer = TopicSummarySerializer(topic)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class QuestionInChapterDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, subject, chapter_slug, topic_slug):
        user = request.user
        chapter = get_object_or_404(Chapter, slug=chapter_slug, subject__name__iexact=subject)
        topic = get_object_or_404(Topic, chapter=chapter, slug=topic_slug)

        all_questions = Question.objects.filter(topic=topic)
        total_questions = all_questions.count()

        seen_ids = SeenQuestion.objects.filter(
            user=user, topic=topic
        ).values_list('question__question_uid', flat=True)

        print(f"[{user.email}] Total questions for topic '{topic.slug}': {total_questions}")
        print(f"[{user.email}] Seen questions: {len(seen_ids)}")


        if len(seen_ids) >= total_questions:
            SeenQuestion.objects.filter(user=user, topic=topic).delete()
            seen_ids = []


        unseen_questions = all_questions.exclude(question_uid__in=seen_ids)
        unseen_count = unseen_questions.count()
        print(f"[{user.email}] Unseen questions remaining: {unseen_count}")
    
        if not unseen_questions.exists():
            return Response({
                "message": "No unseen questions available (even after reset)",
                "total_available": total_questions
            }, status=status.HTTP_200_OK)

        serializer = QuestionSerializer(unseen_questions, many=True)

        return Response({
            "questions": serializer.data,
            "total_available": total_questions
        }, status=status.HTTP_200_OK)
    

############################################################################################


class MarkQuestionSeenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question_uid = request.data.get("question_uid")
        if not question_uid:
            return Response({"detail": "question_uid missing"}, status=400)

        question = get_object_or_404(Question, question_uid=question_uid)

        results = []
        for topic in question.topic.all():
            try:
                with transaction.atomic():
                    obj, created = SeenQuestion.objects.get_or_create(
                        user=request.user,
                        question=question,
                        topic=topic,
                    )
            except IntegrityError:
                created = False

            results.append({
                "topic_id": getattr(topic, "id", None),
                "created": created,
            })

        return Response({"status": "ok", "results": results}, status=200)


class ResetSeenQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)  
        deleted, _ = SeenQuestion.objects.filter(user=request.user, topic=topic).delete()
        return Response({"message": "Seen questions reset.", "deleted": deleted}, status=status.HTTP_200_OK)


############################################################################################


class RandomSACQuestionsView(APIView):
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
            target_mcq, target_sa = 7, 6
            total_needed = target_mcq + target_sa

            mcq_qs = (
                Question.objects
                .filter(topic__in=topics, difficulty="Exam-Level", multiple_choice=True)
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
    

############################################################################################



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
        c = self.request.query_params.get("chapter")  # can be id or slug
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
        # Ensure serializer gets request in context for CurrentUserDefault
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)