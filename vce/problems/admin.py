from django.contrib import admin
from .models import Question, Order, QuestionIssueReport, Solution
# Register your models here.


class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_uid", "uuid", "question_id", "content_type", "text_content", "image_content", "section_order")
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.order_by("question_id", "content_type", "section_order")

class SolutionAdmin(admin.ModelAdmin):
    list_display = ("solution_uid", "uuid", "question_id", "order_id")
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.order_by("question_id")

admin.site.register(Order, OrderAdmin)
admin.site.register(Question)
admin.site.register(Solution, SolutionAdmin)


@admin.register(QuestionIssueReport)
class QuestionIssueReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "question_id",
        "question_excerpt",
        "reported_by",
        "topic",
        "created_at",
    )
    list_filter = ("status", "created_at", "topic__chapter__subject")
    list_editable = ("status",)
    search_fields = (
        "description",
        "question__question_text",
        "reported_by__email",
        "topic__topic_name",
    )
    raw_id_fields = ("question", "reported_by", "topic")
    readonly_fields = ("created_at", "updated_at")
    list_select_related = ("question", "reported_by", "topic")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    @admin.display(description="Question")
    def question_excerpt(self, obj):
        return obj.question.question_text[:90]
