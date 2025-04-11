from django.db import models

# Create your models here.
class Chapter(models.Model):
    chapter_uid = models.BigAutoField(primary_key=True)
    chapter_name = models.CharField(max_length=30)
    chapter_description = models.TextField()

    class Meta:
        db_table = 'chapter'

    def __str__(self):
        return f"{self.chapter_name}"

class Topic(models.Model):
    topic_uid = models.BigAutoField(primary_key=True)
    chapter = models.ForeignKey(Chapter, on_delete = models.SET_NULL, blank=True, null=True)
    topic_name = models.TextField()

    class Meta:
        db_table = 'topic'
    
    def __str__(self):
        return f"{self.chapter}: {self.topic_name}"