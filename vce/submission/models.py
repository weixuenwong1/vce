from django.conf import settings
from django.db import models
from django.utils import timezone
from contents.models import Subject, Chapter, Topic  


def submission_media_path(instance, filename):
    sid = getattr(instance, "submission_id", None) or getattr(instance, "submission_uid", None) or "legacy"
    return f"submission_media/{sid}/{filename}"

class QuestionSubmission(models.Model):
    submission_uid = models.BigAutoField(primary_key=True)

    
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT, related_name='incoming_submissions')
    chapter = models.ForeignKey(Chapter, on_delete=models.PROTECT, related_name='incoming_submissions')
    topic   = models.ForeignKey(Topic,   on_delete=models.PROTECT, related_name='incoming_submissions')

    
    question_text = models.TextField()

    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'question_submission_inbox'
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.submission_uid} • {self.subject} / {self.chapter} / {self.topic}"

