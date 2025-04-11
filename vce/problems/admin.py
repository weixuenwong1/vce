from django.contrib import admin
from .models import Question, Order, Solution
# Register your models here.


class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_uid", "question_id", "content_type", "text_content", "image_content", "section_order")
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.order_by("question_id", "content_type", "section_order")

class SolutionAdmin(admin.ModelAdmin):
    list_display = ("solution_uid", "question_id", "order_id")
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.order_by("question_id")

admin.site.register(Order, OrderAdmin)
admin.site.register(Question)
admin.site.register(Solution, SolutionAdmin)