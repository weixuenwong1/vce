from django.db import models
from django.utils.text import slugify

# Create your models here.
class Subject(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

    class Meta:
        db_table = 'subject'


class Chapter(models.Model):
    chapter_uid = models.BigAutoField(primary_key=True)
    chapter_name = models.CharField(max_length=100)
    chapter_description = models.TextField()
    subject = models.ForeignKey(
        Subject, on_delete=models.PROTECT, related_name="chapters"
    )
    slug = models.SlugField(max_length=50, blank=True, null=True, unique=True)

    class Meta:
        db_table = 'chapter'

    def __str__(self):
        return f"{self.chapter_name}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.chapter_name)
        super().save(*args, **kwargs)


class Topic(models.Model):
    topic_uid = models.BigAutoField(primary_key=True)
    chapter = models.ForeignKey(
        Chapter, on_delete=models.PROTECT, related_name="topics"
    )
    topic_name = models.CharField(max_length=50)
    content = models.TextField(blank=True, null=True)
    slug = models.SlugField(max_length=100, blank=True, null=True, unique=True)

    class Meta:
        db_table = 'topic'
    
    def __str__(self):
        return f"{self.chapter}: {self.topic_name}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.topic_name)
        super().save(*args, **kwargs)