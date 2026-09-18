from rest_framework import serializers
from .models import Course, Lesson, Homework, Review ,Enrollment
from students.models import Student
from tutors.models import Tutor
from accounts.models import User


class CourseTutorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']

# Serializer for Tutor
class TutorSerializer(serializers.ModelSerializer):
    subjects = serializers.ListField(child=serializers.CharField(),required=False)
    user = CourseTutorUserSerializer(read_only=True)

    class Meta:
        model = Tutor
        fields = ['id', 'user', 'profile_picture', 'languages_spoken', 'subjects']

# Serializer for Lesson
class LessonSerializer(serializers.ModelSerializer):
    homeworks = serializers.SerializerMethodField()

    def get_homeworks(self, obj):
        return list(obj.homeworks.values('id', 'title', 'document', 'due_date'))

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'lesson_video', 'lesson_document', 'homeworks']

# Serializer for Course
class CourseSerializer(serializers.ModelSerializer):
    tutor = TutorSerializer(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'courseId', 'title', 'description', 'detail', 'requirements', 'materials',
            'price_per_hour', 'price_per_dollar', 'price_per_toman',
            'language', 'level', 'schedule_day', 'schedule_start', 'schedule_end',
            'capacity', 'active_students', 'length', 'course_duration',
            'image', 'language_flag', 'lessons', 'tutor'
        ]


# Optional: a lightweight Student mini for reviews
class StudentMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'user']

# Serializer for Homework
class HomeworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Homework
        fields = ['id', 'title', 'document', 'due_date']

# Serializer for Review
class ReviewSerializer(serializers.ModelSerializer):
    student = StudentMiniSerializer(read_only=True)
    tutor = TutorSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['student', 'tutor', 'review_text', 'rating', 'review_date']



# NEW: Enrollment serializers
class EnrollmentCreateSerializer(serializers.ModelSerializer):
    # client sends payment info + proof; student inferred from request
    payment_proof = serializers.ImageField(required=True, allow_null=False)
    payment_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    currency = serializers.CharField(required=True)

    def validate_payment_amount(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than 0.")
        return value

    class Meta:
        model = Enrollment
        fields = ['course', 'payment_amount', 'currency', 'payment_note', 'payment_proof']

class EnrollmentDetailSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student_id = serializers.IntegerField(read_only=True)
    student_name = serializers.SerializerMethodField()

    def get_student_name(self, obj):
        user = obj.student.user
        return f"{user.first_name} {user.last_name}".strip() or user.email

    class Meta:
        model = Enrollment
        fields = ['student_id', 'student_name', 'id', 'course', 'status', 'payment_amount', 'currency', 'payment_note',
                  'payment_proof', 'submitted_at', 'reviewed_at']
