from django.contrib import admin
from .models import QuestionSubmission

@admin.register(QuestionSubmission)
class QuestionSubmissionAdmin(admin.ModelAdmin):
    list_display = ('submission_uid', 'subject', 'chapter', 'topic', 'created_at')
    list_filter = ('subject', 'chapter', 'topic')
    search_fields = ('question_text',)