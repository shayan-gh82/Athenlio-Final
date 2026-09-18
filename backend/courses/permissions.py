from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerTutorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        # GET/HEAD/OPTIONS = آزاد
        if request.method in SAFE_METHODS:
            return True
        # باید لاگین باشد و صاحبش باشد
        return hasattr(request.user, "tutor") and obj.tutor == request.user.tutor


class IsSelfStudent(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is Student
        return request.user.is_authenticated and hasattr(request.user, 'student_profile') and obj.user_id == request.user.id

class IsTutorOfCourseOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is Enrollment
        if not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        # tutor owner
        try:
            return obj.course.tutor.user_id == request.user.id
        except Exception:
            return False