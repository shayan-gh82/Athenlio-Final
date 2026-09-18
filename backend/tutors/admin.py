# tutors/admin.py
from django.contrib import admin
from .models import Tutor, TutorCertificate, TutorEducation, TutorExperience,TutorCourse

class TutorCertificateInline(admin.StackedInline):
    model = TutorCertificate
    extra = 0

class TutorEducationInline(admin.StackedInline):
    model = TutorEducation
    extra = 0
#/admin.py
class TutorExperienceInline(admin.StackedInline):
    model = TutorExperience
    extra = 0


class TutorCourseInline(admin.TabularInline):
    model = TutorCourse
    extra = 0

@admin.register(Tutor)
class TutorAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "country", "phone_number","is_approved")
    list_filter = ("country","is_approved")
    search_fields = ("user__first_name", "user__last_name", "user__email", "country")
    inlines = [TutorCertificateInline, TutorEducationInline, TutorExperienceInline,TutorCourseInline]

    actions = ["approve_selected_tutors","reject_selected_tutors"]

    def approve_selected_tutors(self,request,queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request,f"approved {updated} tutor(s).")
    approve_selected_tutors.short_description = "Approve selected tutors"

    def reject_selected_tutors(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f"Marked {updated} tutor(s) as not approved.")

    reject_selected_tutors.short_description = "Reject selected tutors (set is_approved = False)"


admin.site.register(TutorCertificate)
admin.site.register(TutorEducation)
admin.site.register(TutorExperience)
admin.site.register(TutorCourse)
