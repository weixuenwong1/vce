from django.urls import path
from . import views

urlpatterns = [
    path('questions/', views.questionList, name="question-list"),
]