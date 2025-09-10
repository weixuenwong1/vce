from django.urls import path
from .views import (
    ChapterListView,
    TopicsByChapterSlugView,
    NextQuestionView,
    TopicSummaryView,
    RandomSACQuestionsView,
    ChapterBySlugView,
    ResetSeenQuestionsView,
    SubjectListView,
    SubjectChaptersView,
    QuestionSubmissionListCreateView,
)

urlpatterns = [
    path("subjects/", SubjectListView.as_view(), name="subject-list"),
    path("subjects/<int:subject_id>/chapters/", SubjectChaptersView.as_view(), name="subject-chapters"),
    path('chapters/', ChapterListView.as_view(), name='chapter-list'),
    path('chapters/<slug:slug>/', ChapterBySlugView.as_view(), name='chapter-by-slug'),
    path('chapters/<slug:slug>/topics/', TopicsByChapterSlugView.as_view(), name='chapter-topics'),
    path('problems/<slug:subject>/<slug:chapter_slug>/<slug:topic_slug>/', NextQuestionView.as_view(), name='next-question'),

    path("reset-seen/<int:topic_id>/", ResetSeenQuestionsView.as_view()),

    path('summary/<slug:subject>/<slug:chapter_slug>/<slug:topic_slug>/', TopicSummaryView.as_view(), name='topic-summary'),
    
    path('sac/<str:subject>/<slug:chapter_slug>/', RandomSACQuestionsView.as_view(), name='sac-questions'),
    
    path('inbox/submissions/', QuestionSubmissionListCreateView.as_view(), name='question-submissions'),
]

