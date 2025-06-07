from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
import random

from rest_framework.decorators import api_view
from rest_framework.response import Response

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