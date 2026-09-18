# courses/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Course, Lesson, Homework, Review, Enrollment
from django.utils import timezone

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "tutor", "language", "level", "capacity", "active_students")
    search_fields = ("title", "description", "detail", "tutor__user__first_name", "tutor__user__last_name")
    list_filter = ("language", "level", "schedule_day")
    readonly_fields = ()
    # If you want to show related lessons inline:
    # inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course")
    search_fields = ("title", "course__title")

@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "lesson", "due_date")
    search_fields = ("title", "lesson__title")
    list_filter = ("due_date",)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "tutor", "rating", "review_date")
    search_fields = ("student__user__first_name", "student__user__last_name",
                     "tutor__user__first_name", "tutor__user__last_name")
    list_filter = ("rating", "review_date")

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "student_name", "course_title", "status",
                    "payment_amount", "currency", "submitted_at",
                    "reviewed_at", "reviewed_by")
    list_filter = ("status", "currency", "submitted_at")
    search_fields = ("student__user__email", "student__user__first_name",
                     "student__user__last_name", "course__title")
    readonly_fields = ("submitted_at", "reviewed_at", "reviewed_by", "payment_proof_preview")
    fields = (
        "student", "course", "status",
        "payment_amount", "currency", "payment_note",
        "payment_proof", "payment_proof_preview",
        "submitted_at", "reviewed_at", "reviewed_by",
    )
    actions = ["approve_selected", "reject_selected"]

    def student_name(self, obj):
        u = obj.student.user
        name = (f"{u.first_name} {u.last_name}").strip()
        return name or u.email

    def course_title(self, obj):
        return obj.course.title

    def payment_proof_preview(self, obj):
        if obj.payment_proof:
            url = obj.payment_proof.url
            return format_html('<a href="{0}" target="_blank"><img src="{0}" style="max-height:160px"/></a>', url)
        return "—"
    payment_proof_preview.short_description = "Payment proof"

    def save_model(self, request, obj, form, change):
        # Block approving without proof
        if obj.status == "approved" and not obj.payment_proof:
            self.message_user(request, "Cannot approve without payment proof.", level="error")
            return  # do not save

        previous_status = None
        if change:
            previous_status = Enrollment.objects.get(pk=obj.pk).status

        super().save_model(request, obj, form, change)

        # Side effects on status change
        if previous_status != obj.status:
            if obj.status in ("approved", "rejected"):
                if not obj.reviewed_by:
                    obj.reviewed_by = request.user
                if not obj.reviewed_at:
                    obj.reviewed_at = timezone.now()
                obj.save(update_fields=["reviewed_by", "reviewed_at"])

            if obj.status == "approved" and previous_status != "approved":
                # add student to course, bump active_students once
                obj.student.courses_list.add(obj.course)
                course = obj.course
                course.active_students = (course.active_students or 0) + 1
                course.save(update_fields=["active_students"])

    def approve_selected(self, request, queryset):
        approved = 0
        for e in queryset.select_related("course", "student"):
            if not e.payment_proof:
                continue  # skip those without proof
            if e.status != "approved":
                e.status = "approved"
                e.reviewed_by = request.user
                e.reviewed_at = timezone.now()
                e.save(update_fields=["status", "reviewed_by", "reviewed_at"])
                e.student.courses_list.add(e.course)
                e.course.active_students = (e.course.active_students or 0) + 1
                e.course.save(update_fields=["active_students"])
                approved += 1
        if approved:
            self.message_user(request, f"Approved {approved} enrollment(s).")
        else:
            self.message_user(request, "No enrollments approved (missing proofs?).", level="warning")
    approve_selected.short_description = "Approve selected enrollments (requires proof)"

    def reject_selected(self, request, queryset):
        rejected = 0
        for e in queryset:
            if e.status != "rejected":
                e.status = "rejected"
                e.reviewed_by = request.user
                e.reviewed_at = timezone.now()
                e.save(update_fields=["status", "reviewed_by", "reviewed_at"])
                rejected += 1
        self.message_user(request, f"Rejected {rejected} enrollment(s).")
    reject_selected.short_description = "Reject selected enrollments"