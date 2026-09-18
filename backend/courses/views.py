#course/views
from rest_framework import viewsets , status
from .models import Course, Lesson, Homework, Review , Enrollment
from .serializers import (
    CourseSerializer, LessonSerializer, HomeworkSerializer, ReviewSerializer,
    EnrollmentCreateSerializer, EnrollmentDetailSerializer
)
from students.serializers import StudentSerializer
from students.models import Student
from tutors.models import Tutor
from tutors.serializers import TutorSerializer
from .permissions import IsTutorOfCourseOrAdmin

from rest_framework.permissions import IsAuthenticated,AllowAny

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly,IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from rest_framework.exceptions import PermissionDenied

from django_filters.rest_framework import DjangoFilterBackend



from .models import Course
from .serializers import CourseSerializer
from .permissions import IsOwnerTutorOrReadOnly


# View for Course
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related("tutor").all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerTutorOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    # فیلترهای نمونه
    filterset_fields = ['language', 'level', 'schedule_day']
    search_fields = ['title', 'description', 'detail']
    ordering_fields = ['price_per_hour', 'price_per_dollar', 'price_per_toman', 'title']
    ordering = ['title']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action not in ('list', 'retrieve'):
            return queryset
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return queryset
        if user.is_authenticated and hasattr(user, 'tutor'):
            from django.db.models import Q
            return queryset.filter(Q(tutor__is_approved=True) | Q(tutor=user.tutor)).distinct()
        return queryset.filter(tutor__is_approved=True)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, "tutor"):
            raise PermissionDenied("Only tutors can create courses.")
        if not user.tutor.is_approved:
            raise PermissionDenied("Tutor approval is required to create courses.")
        serializer.save(tutor=user.tutor)

    def perform_update(self, serializer):
        # پرمیشن کلاس هم چک می‌کند، ولی اینجا هم مالکیت را enforce می‌کنیم
        course = self.get_object()
        if not hasattr(self.request.user, "tutor") or course.tutor != self.request.user.tutor:
            raise PermissionDenied("You can edit only your own courses.")
        serializer.save()

# View for Tutor
class TutorViewSet(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()
    serializer_class = TutorSerializer
    permission_classes = [AllowAny]

# View for Student
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

# View for Lesson
class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]

# View for Homework
class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [IsAuthenticated]

# View for Review
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.select_related('student__user', 'course', 'course__tutor__user')
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return queryset
        if hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)
        if hasattr(user, 'tutor'):
            return queryset.filter(course__tutor=user.tutor)
        return queryset.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EnrollmentCreateSerializer
        return EnrollmentDetailSerializer

    def perform_create(self, serializer):
        # attach current user's student profile
        try:
            student = self.request.user.student_profile
        except Student.DoesNotExist:
            raise PermissionDenied("Only students can enroll.")

        # Require proof here too
        data = serializer.validated_data
        if not data.get("payment_proof"):
            raise PermissionDenied("Payment proof image is required.")

        enrollment = serializer.save(student=student, status="under_review")

        # enrollment = serializer.save(student=student, status="pending_payment")
        # optional: if they already attached proof, move to under_review
        if enrollment.payment_proof:
            enrollment.status = "under_review"
            enrollment.save(update_fields=['status'])

    @action(detail=False, methods=['get'], url_path='my')
    def my_enrollments(self, request):
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response([], status=200)
        qs = self.queryset.filter(student=student).order_by('-submitted_at')
        return Response(EnrollmentDetailSerializer(qs, many=True).data)

    @action(detail=True, methods=['patch'], url_path='approve', permission_classes=[IsAuthenticated, IsTutorOfCourseOrAdmin])
    def approve(self, request, pk=None):
        enrollment = self.get_object()

        if not enrollment.payment_proof:
            return Response({"detail": "Cannot approve without payment proof."}, status=400)

        if enrollment.status == "approved":
            return Response({"detail": "Already approved."}, status=200)
        enrollment.status = "approved"
        enrollment.reviewed_at = timezone.now()
        enrollment.reviewed_by = request.user
        enrollment.save(update_fields=['status', 'reviewed_at', 'reviewed_by'])
        # sync denormalized counters / lists
        course = enrollment.course
        course.active_students = course.active_students + 1
        course.save(update_fields=['active_students'])
        # keep your many-to-many for fast reads
        enrollment.student.courses_list.add(course)
        return Response(EnrollmentDetailSerializer(enrollment).data, status=200)

    @action(detail=True, methods=['patch'], url_path='reject', permission_classes=[IsAuthenticated, IsTutorOfCourseOrAdmin])
    def reject(self, request, pk=None):
        enrollment = self.get_object()
        note = request.data.get('payment_note', '')
        enrollment.status = "rejected"
        if note:
            enrollment.payment_note = note
        enrollment.reviewed_at = timezone.now()
        enrollment.reviewed_by = request.user
        enrollment.save(update_fields=['status', 'payment_note', 'reviewed_at', 'reviewed_by'])
        return Response(EnrollmentDetailSerializer(enrollment).data, status=200)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]  # must be logged in to see lessons

    def list(self, request, *args, **kwargs):
        course_id = request.query_params.get('course')
        if not course_id:
            raise PermissionDenied("Course id is required to list lessons.")
        # must be approved to see
        try:
            student = request.user.student_profile
        except Exception:
            raise PermissionDenied("Only students can view lessons.")
        is_approved = Enrollment.objects.filter(
            student=student, course_id=course_id, status='approved'
        ).exists()
        if not is_approved:
            raise PermissionDenied("Your enrollment for this course is not approved yet.")
        self.queryset = self.queryset.filter(course_id=course_id)
        return super().list(request, *args, **kwargs)
