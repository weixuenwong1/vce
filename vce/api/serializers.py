from rest_framework import serializers
from problems.models import Question
from rest_framework import serializers
from contents.models import Chapter, Topic
from problems.models import Question, Order, Solution


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['chapter_uid', 'chapter_name', 'slug', 'chapter_description']


class TopicSerializer(serializers.ModelSerializer):
    chapter = ChapterSerializer(read_only=True)

    class Meta:
        model = Topic
        fields = ['topic_uid', 'topic_name', 'slug', 'chapter']


###########################################################################################


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['content_type', 'text_content', 'image_content', 'section_order']


class SolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solution
        fields = ['solution_text', 'solution_image']


class QuestionSerializer(serializers.ModelSerializer):
    orders = OrderSerializer(many=True, read_only=True)
    solutions = SolutionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['question_uid', 'question_text', 'difficulty', 'created_at', 'orders', 'solutions']
