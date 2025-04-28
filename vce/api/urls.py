from django.urls import path
from .views import (
    ChapterListView,
    TopicsByChapterSlugView,
    TopicInChapterDetailView,
    QuestionInChapterDetailView
)

urlpatterns = [
    path('physics/chapters/', ChapterListView.as_view(), name='chapter-list'),
    path('physics/chapters/<slug:slug>/topics/', TopicsByChapterSlugView.as_view(), name='chapter-topics'),
    path('physics/chapters/<slug:chapter_slug>/<slug:topic_slug>/', TopicInChapterDetailView.as_view(), name='topic-in-chapter-detail'),

    path('physics/problems/<slug:chapter_slug>/<slug:topic_slug>/', QuestionInChapterDetailView.as_view(), name='topic-in-chapter-detail'),
]

