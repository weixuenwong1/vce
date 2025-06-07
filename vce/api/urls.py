from django.urls import path
from .views import (
    ChapterListView,
    TopicsByChapterSlugView,
    TopicInChapterDetailView,
    QuestionInChapterDetailView,
    TopicSummaryView
)

urlpatterns = [
    path('chapters/', ChapterListView.as_view(), name='chapter-list'),
    path('chapters/<slug:slug>/topics/', TopicsByChapterSlugView.as_view(), name='chapter-topics'),
    path('chapters/<slug:chapter_slug>/<slug:topic_slug>/', TopicInChapterDetailView.as_view(), name='topic-in-chapter-detail'),

    path('problems/<slug:subject>/<slug:chapter_slug>/<slug:topic_slug>/', QuestionInChapterDetailView.as_view(), name='topic-in-chapter-detail'),
    path('summary/<slug:subject>/<slug:chapter_slug>/<slug:topic_slug>/', TopicSummaryView.as_view(), name='topic-summary'),
]

