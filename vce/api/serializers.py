from rest_framework import serializers
from contents.models import Subject, Chapter, Topic
from problems.models import Question, Order, Solution
from submission.models import QuestionSubmission


# ------------------------
# BASIC CONTENT SERIALIZERS
# ------------------------

class SubjectSerializer(serializers.ModelSerializer):
    """Serialize Subject model with just ID + name."""
    class Meta:
        model = Subject
        fields = ["id", "name"]


class ChapterSerializer(serializers.ModelSerializer):
    # Show subject name instead of full nested object
    subject = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Chapter
        fields = ['chapter_uid', 'chapter_name', 'slug', 'chapter_description', 'subject']


class TopicSerializer(serializers.ModelSerializer):
    # Nest chapter info inside topic
    chapter = ChapterSerializer(read_only=True)

    class Meta:
        model = Topic
        fields = ['topic_uid', 'topic_name', 'slug', 'chapter']


class TopicSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for topic summaries (used in summaries page)."""
    class Meta:
        model = Topic
        fields = ['topic_name', 'content']


# ------------------------
# QUESTION + SOLUTION SERIALIZERS
# ------------------------

class SolutionSerializer(serializers.ModelSerializer):
    """Serialize a solution (text and/or image)."""
    class Meta:
        model = Solution
        fields = ['solution_text', 'solution_image']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serialize an 'Order' block of a question.
    Includes text, image, and its linked solution (if present).
    """
    solution = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'order_uid',
            'content_type',   # TEXT / IMAGE
            'text_content',
            'image_content',
            'section_order',  # the position of the block in the question
            'solution'
        ]

    def get_solution(self, obj):
        # Each order may have an attached solution object
        solution = getattr(obj, 'solution', None)
        if solution:
            return SolutionSerializer(solution).data
        return None


class QuestionSerializer(serializers.ModelSerializer):
    """
    Serialize a Question:
    - its text, difficulty, and ID
    - all of its 'orders' (parts of the question)
    - optional general_solution (solution not tied to an order)
    """
    orders = serializers.SerializerMethodField()
    general_solution = serializers.SerializerMethodField() 

    class Meta:
        model = Question
        fields = [
            'question_uid',
            'question_text',
            'difficulty',
            'multiple_choice',
            'orders',
            'general_solution'
        ]

    def get_orders(self, obj):
        # Fetch all related orders in sequence
        orders = obj.order.all().order_by('section_order')
        return OrderSerializer(orders, many=True).data

    def get_general_solution(self, obj):
        # Fetch solution not tied to a specific order (general solution)
        solution = Solution.objects.filter(question_id=obj, order_id__isnull=True).first()
        if solution:
            return SolutionSerializer(solution).data
        return None


# ------------------------
# QUESTION SUBMISSION SERIALIZER
# ------------------------

class QuestionSubmissionSerializer(serializers.ModelSerializer):
    """
    Used for the question submission 'inbox':
    - Normal users POST submissions
    - Admins GET and review them
    """
    id = serializers.IntegerField(read_only=True, source="pk")
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    topic   = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all())
    chapter = serializers.SlugRelatedField(slug_field="slug", queryset=Chapter.objects.all())
    submitted_by = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = QuestionSubmission
        fields = (
            "id",
            "subject",
            "chapter",
            "topic",
            "question_text",
            "submitted_by",
            "created_at"
        )
        read_only_fields = ("created_at",)

    def validate(self, attrs):
        """
        Custom validation:
        - Chapter must belong to the selected subject
        - Topic must belong to the selected chapter
        """
        subject = attrs["subject"]   # Subject instance
        chapter = attrs["chapter"]   # Chapter instance
        topic   = attrs["topic"]     # Topic instance

        if chapter.subject_id != subject.pk:
            raise serializers.ValidationError(
                "Chapter does not belong to the selected subject."
            )

        if topic.chapter_id != chapter.pk:
            raise serializers.ValidationError(
                "Topic does not belong to the selected chapter."
            )

        return attrs
