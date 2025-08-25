import uuid
from django.db import models
from contents.models import Topic
from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings

class Question(models.Model):
    question_uid = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=True)
    topic = models.ManyToManyField(Topic, related_name='questions')
    question_text = models.TextField()
    difficulty = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    multiple_choice = models.BooleanField(default=False)

    class Meta:
        db_table = 'question'

    def __str__(self):
        return f"{self.question_uid}: {self.question_text[:20]}"


class Order(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('TEXT', 'Text'),
        ('IMAGE', 'Image'),
    ]
    order_uid = models.BigAutoField(primary_key=True)
    question_id = models.ForeignKey(Question, on_delete = models.SET_NULL, null=True, related_name='order')
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=True) 
    content_type = models.CharField(max_length = 15, choices=CONTENT_TYPE_CHOICES)
    text_content = models.TextField(blank=True, null=True)
    image_content = models.ImageField(upload_to='question_media/', storage=S3Boto3Storage() , blank=True, null=True)
    section_order = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        db_table = 'order'
    
    def __str__(self):
        return f"{self.question_id}, {self.text_content[:50]}"

class Solution(models.Model):
    solution_uid = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=True)
    question_id = models.ForeignKey(Question, on_delete = models.SET_NULL, null=True, blank=True, related_name='solution')
    order_id = models.OneToOneField(Order, on_delete = models.SET_NULL, null=True, blank=True, related_name='solution')
    solution_text = models.TextField()
    solution_image = models.ImageField(upload_to='solution_media/', storage=S3Boto3Storage(), blank=True, null=True)
    


    class Meta:
        db_table = 'solution'
    
    def __str__(self):
        return f"{self.question_id}"
    

class SeenQuestion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "question", "topic"],
                name="uq_seen_user_question_topic",
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.question.question_uid}"



