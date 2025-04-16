from django.urls import path
from .views import (
    QuestionListView,
    ChapterListView,
    TopicsByChapterSlugView,
    TopicInChapterDetailView
)

urlpatterns = [
    path('physics/questions/', QuestionListView.as_view(), name='physics-question-list'),

    path('physics/chapters/', ChapterListView.as_view(), name='chapter-list'),
    path('physics/chapters/<slug:slug>/topics/', TopicsByChapterSlugView.as_view(), name='chapter-topics'),

    path('physics/chapters/<slug:chapter_slug>/<slug:topic_slug>/', TopicInChapterDetailView.as_view(), name='topic-in-chapter-detail'),

]

