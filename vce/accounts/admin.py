from datetime import timedelta

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models import BigIntegerField, Max, Prefetch, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html

from .models import CustomUser, UserEngagementDashboard, UserSubjectEngagement


class UserSubjectEngagementInline(admin.TabularInline):
    model = UserSubjectEngagement
    extra = 0
    can_delete = False
    fields = (
        "subject",
        "questions_viewed",
        "summaries_viewed",
        "practice_sacs_started",
        "first_activity_at",
        "last_activity_at",
    )
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    ordering = ("email",)
    list_display = (
        "email",
        "school",
        "teacher",
        "is_active",
        "date_joined",
        "last_login",
    )
    list_filter = ("is_active", "teacher", "is_staff", "date_joined")
    search_fields = ("email", "school")
    readonly_fields = ("date_joined", "last_login")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("username", "school", "teacher")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "school",
                    "teacher",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )
    inlines = (UserSubjectEngagementInline,)


@admin.register(UserEngagementDashboard)
class UserEngagementDashboardAdmin(admin.ModelAdmin):
    change_list_template = "admin/accounts/userengagementdashboard/change_list.html"
    list_display = (
        "user_email",
        "school",
        "joined",
        "last_login_at",
        "question_total",
        "summary_total",
        "sac_total",
        "physics_activity",
        "chemistry_activity",
        "biology_activity",
        "last_activity",
    )
    list_filter = ("is_active", "teacher", "date_joined")
    search_fields = ("email", "school")
    date_hierarchy = "date_joined"
    list_per_page = 50
    actions = None
    list_display_links = None

    def get_queryset(self, request):
        engagement_rows = UserSubjectEngagement.objects.select_related("subject").order_by(
            "subject__name"
        )
        return (
            super()
            .get_queryset(request)
            .filter(is_staff=False)
            .prefetch_related(
                Prefetch(
                    "subject_engagement",
                    queryset=engagement_rows,
                    to_attr="engagement_rows",
                )
            )
            .annotate(
                engagement_questions=Coalesce(
                    Sum("subject_engagement__questions_viewed"),
                    Value(0),
                    output_field=BigIntegerField(),
                ),
                engagement_summaries=Coalesce(
                    Sum("subject_engagement__summaries_viewed"),
                    Value(0),
                    output_field=BigIntegerField(),
                ),
                engagement_sacs=Coalesce(
                    Sum("subject_engagement__practice_sacs_started"),
                    Value(0),
                    output_field=BigIntegerField(),
                ),
                engagement_last_activity=Max("subject_engagement__last_activity_at"),
            )
            .order_by("-engagement_last_activity", "-date_joined")
        )

    def changelist_view(self, request, extra_context=None):
        students = CustomUser.objects.filter(is_staff=False)
        engagement = UserSubjectEngagement.objects.filter(user__is_staff=False)
        now = timezone.now()
        totals = engagement.aggregate(
            questions=Coalesce(
                Sum("questions_viewed"), Value(0), output_field=BigIntegerField()
            ),
            summaries=Coalesce(
                Sum("summaries_viewed"), Value(0), output_field=BigIntegerField()
            ),
            sacs=Coalesce(
                Sum("practice_sacs_started"), Value(0), output_field=BigIntegerField()
            ),
        )
        extra_context = {
            **(extra_context or {}),
            "title": "User engagement",
            "dashboard_cards": [
                ("Current users", students.filter(is_active=True).count()),
                (
                    "Joined in 30 days",
                    students.filter(date_joined__gte=now - timedelta(days=30)).count(),
                ),
                (
                    "Active in 30 days",
                    engagement.filter(
                        Q(last_activity_at__gte=now - timedelta(days=30))
                    )
                    .values("user_id")
                    .distinct()
                    .count(),
                ),
                ("Questions viewed", totals["questions"]),
                ("Summaries opened", totals["summaries"]),
                ("Practice SACs", totals["sacs"]),
            ],
            "tracking_note": (
                "Question totals were seeded from the retained SeenQuestion rows. "
                "Summary and practice SAC tracking starts from this deployment."
            ),
        }
        return super().changelist_view(request, extra_context=extra_context)

    @admin.display(description="Joined", ordering="date_joined")
    def joined(self, obj):
        return obj.date_joined

    @admin.display(description="Email", ordering="email")
    def user_email(self, obj):
        return format_html(
            '<a href="{}">{}</a>',
            reverse("admin:accounts_customuser_change", args=[obj.pk]),
            obj.email,
        )

    @admin.display(description="Last login", ordering="last_login")
    def last_login_at(self, obj):
        return obj.last_login or "-"

    @admin.display(description="Questions", ordering="engagement_questions")
    def question_total(self, obj):
        return obj.engagement_questions

    @admin.display(description="Summaries", ordering="engagement_summaries")
    def summary_total(self, obj):
        return obj.engagement_summaries

    @admin.display(description="SACs", ordering="engagement_sacs")
    def sac_total(self, obj):
        return obj.engagement_sacs

    def _subject_activity(self, obj, subject_name):
        row = next(
            (
                item
                for item in getattr(obj, "engagement_rows", [])
                if item.subject.name.casefold() == subject_name.casefold()
            ),
            None,
        )
        if row is None:
            return format_html('<span class="engagement-empty">No activity</span>')
        return format_html(
            '<span class="engagement-metric">Q <b>{}</b></span>'
            '<span class="engagement-metric">S <b>{}</b></span>'
            '<span class="engagement-metric">SAC <b>{}</b></span>',
            row.questions_viewed,
            row.summaries_viewed,
            row.practice_sacs_started,
        )

    @admin.display(description="Physics")
    def physics_activity(self, obj):
        return self._subject_activity(obj, "Physics")

    @admin.display(description="Chemistry")
    def chemistry_activity(self, obj):
        return self._subject_activity(obj, "Chemistry")

    @admin.display(description="Biology")
    def biology_activity(self, obj):
        return self._subject_activity(obj, "Biology")

    @admin.display(description="Last activity", ordering="engagement_last_activity")
    def last_activity(self, obj):
        return obj.engagement_last_activity or "-"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
