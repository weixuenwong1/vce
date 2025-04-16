from rest_framework import serializers
from problems.models import Question
from rest_framework import serializers
from contents.models import Chapter, Topic

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['chapter_uid', 'chapter_name', 'slug', 'chapter_description']


class TopicSerializer(serializers.ModelSerializer):
    chapter = ChapterSerializer(read_only=True)

    class Meta:
        model = Topic
        fields = ['topic_uid', 'topic_name', 'slug', 'chapter']
