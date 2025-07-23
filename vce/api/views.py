from rest_framework import generics, status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from rest_framework.response import Response
import random

from .serializers import QuestionSerializer, ChapterSerializer, TopicSerializer, TopicSummarySerializer
from problems.models import Question
from contents.models import Chapter, Topic
# Create your views here.


class ChapterListView(generics.ListAPIView):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer


class TopicsByChapterSlugView(generics.ListAPIView):
    serializer_class = TopicSerializer

    def get_queryset(self):
        return Topic.objects.filter(chapter__slug=self.kwargs['slug'])


class TopicInChapterDetailView(APIView):
    def get(self, request, chapter_slug, topic_slug):
        chapter = get_object_or_404(Chapter, slug=chapter_slug)
        topic = get_object_or_404(Topic, slug=topic_slug, chapter=chapter)
        serializer = TopicSerializer(topic)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

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
    def get(self, request, subject, chapter_slug, topic_slug):
        chapter = get_object_or_404(Chapter, slug=chapter_slug, subject__name__iexact=subject)
        topic = get_object_or_404(Topic, chapter=chapter, slug=topic_slug)
        
        count = request.GET.get('count', 1)
        try:
            count = int(count)
        except ValueError:
            count = 1

        questions = Question.objects.filter(topic=topic)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class RandomSACQuestionsView(APIView):
    def get(self, request, subject, chapter_slug):
        chapter = get_object_or_404(Chapter, subject__name__iexact=subject, slug=chapter_slug)

        topics = Topic.objects.filter(chapter=chapter)
        if not topics.exists():
            return Response({"error": "No topics found for this chapter"}, status=status.HTTP_404_NOT_FOUND)

        total_questions = int(request.GET.get('count', 13))
        questions_per_topic = max(1, total_questions // topics.count())
        collected_questions = []

        for topic in topics:
            topic_questions = list(Question.objects.filter(topic=topic, difficulty='Exam-Level'))
            if topic_questions:
                selected = random.sample(
                    topic_questions,
                    min(questions_per_topic, len(topic_questions))
                )
                collected_questions.extend(selected)

        if len(collected_questions) < total_questions:
            fallback_pool = Question.objects.filter(
                topic__in=topics,
                difficulty='Exam-Level'
            ).exclude(question_uid__in=[q.question_uid for q in collected_questions])

            extra_needed = total_questions - len(collected_questions)
            extra = random.sample(
                list(fallback_pool),
                min(extra_needed, fallback_pool.count())
            )
            collected_questions.extend(extra)

        random.shuffle(collected_questions)
        final_questions = collected_questions[:total_questions]

        serializer = QuestionSerializer(final_questions, many=True)
        return Response(serializer.data)
    

class ChapterBySlugView(APIView):
    def get(self, request, slug):
        chapter = get_object_or_404(Chapter, slug=slug)
        return Response({
            "chapter_name": chapter.chapter_name
        })