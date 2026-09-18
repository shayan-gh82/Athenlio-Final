# students/views.py (add)
from rest_framework import permissions, status, viewsets, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import User
from courses.models import Enrollment
from .models import Student
from .serializers import (
    StudentSerializer,
    StudentProfileReadSerializer,
    StudentProfileUpdateSerializer,
    UserProfileUpdateSerializer,
)
from courses.serializers import EnrollmentDetailSerializer, CourseSerializer
from .serializers import CombinedStudentProfileUpdateSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    @action(detail=False, methods=['get'], url_path='me/dashboard', permission_classes=[permissions.IsAuthenticated])
    def my_dashboard(self, request):
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({"detail": "No student profile."}, status=404)
        enrollments = Enrollment.objects.filter(student=student).select_related('course', 'course__tutor__user')
        data = {
            "student": StudentSerializer(student).data,
            "enrollments": EnrollmentDetailSerializer(enrollments, many=True).data,
            "approved_courses": CourseSerializer(
                [e.course for e in enrollments if e.status == "approved"], many=True
            ).data,
        }
        return Response(data, status=200)

    @action(detail=False, methods=['get'], url_path='me', permission_classes=[permissions.IsAuthenticated])
    def current_profile(self, request):
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({"detail": "No student profile."}, status=404)
        return Response(StudentProfileReadSerializer({"user": request.user, "student": student}).data)

    @action(detail=False, methods=['patch'], url_path='me/profile', permission_classes=[permissions.IsAuthenticated])
    def update_my_profile(self, request):
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({"detail": "No student profile."}, status=404)

        # Allow updating both user and student pieces
        user_ser = UserProfileUpdateSerializer(instance=request.user, data=request.data, partial=True)
        stu_ser = StudentProfileUpdateSerializer(instance=student, data=request.data, partial=True)

        user_ser.is_valid(raise_exception=True)
        stu_ser.is_valid(raise_exception=True)

        user_ser.save()
        stu_ser.save()
        return Response({
            "user": user_ser.data,
            "student": StudentSerializer(student).data
        }, status=200)


class StudentProfileViewSet(generics.RetrieveAPIView):
    serializer_class = CombinedStudentProfileUpdateSerializer
    permission_classes = [IsAuthenticated]


    def get_object(self):
        return self.request.user.student_profile

    def get_serializer_class(self):
        # We use Retrieve for GET, and Combined for PATCH
        if self.request.method in ['PATCH', 'PUT']:
            return CombinedStudentProfileUpdateSerializer
        return StudentProfileReadSerializer
