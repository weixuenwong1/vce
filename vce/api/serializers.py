from rest_framework import serializers
from problems.models import Question
from rest_framework import serializers
from contents.models import Subject, Chapter, Topic
from problems.models import Question, Order, Solution
from rest_framework import serializers
from submission.models import QuestionSubmission


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name"]

class ChapterSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Chapter
        fields = ['chapter_uid', 'chapter_name', 'slug', 'chapter_description', 'subject']


class TopicSerializer(serializers.ModelSerializer):
    chapter = ChapterSerializer(read_only=True)

    class Meta:
        model = Topic
        fields = ['topic_uid', 'topic_name', 'slug', 'chapter']


class TopicSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['topic_name', 'content']


###########################################################################################


class SolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solution
        fields = ['solution_text', 'solution_image']


class OrderSerializer(serializers.ModelSerializer):
    solution = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['order_uid', 'content_type', 'text_content', 'image_content', 'section_order', 'solution']

    def get_solution(self, obj):
        solution = getattr(obj, 'solution', None)
        if solution:
            return SolutionSerializer(solution).data
        return None


class QuestionSerializer(serializers.ModelSerializer):
    orders = serializers.SerializerMethodField()
    general_solution = serializers.SerializerMethodField() 

    class Meta:
        model = Question
        fields = ['question_uid', 'question_text', 'difficulty', 'orders', 'general_solution']

    def get_orders(self, obj):
        orders = obj.order.all().order_by('section_order')
        return OrderSerializer(orders, many=True).data

    def get_general_solution(self, obj):
        solution = Solution.objects.filter(question_id=obj, order_id__isnull=True).first()
        if solution:
            return SolutionSerializer(solution).data
        return None

###########################################################################################


class QuestionSubmissionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True, source="pk")
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    topic   = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all())
    chapter = serializers.SlugRelatedField(slug_field="slug", queryset=Chapter.objects.all())
    submitted_by = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = QuestionSubmission
        fields = ("id", "subject", "chapter", "topic", "question_text", "submitted_by", "created_at")
        read_only_fields = ("created_at",)

    def validate(self, attrs):
        subject = attrs["subject"]   # Subject instance
        chapter = attrs["chapter"]   # Chapter instance (from SlugRelatedField)
        topic   = attrs["topic"]     # Topic instance

        # Chapter must belong to Subject
        if chapter.subject_id != subject.pk:
            raise serializers.ValidationError("Chapter does not belong to the selected subject.")

        # Topic must belong to Chapter
        if topic.chapter_id != chapter.pk:   # chapter.pk works whether PK is 'id' or 'chapter_uid'
            raise serializers.ValidationError("Topic does not belong to the selected chapter.")

        return attrs

