#course/models
from django.db import models
from tutors.models import Tutor
from accounts.models import User  # Add the import for User model
from django.conf import settings

# Course Model
class Course(models.Model):

    tutor = models.ForeignKey(Tutor, related_name='tutored_courses', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    courseId = models.CharField(default='cr1001', max_length=20, unique=True)
    description = models.TextField(default='Default course description')
    detail = models.TextField(default='Default course detail')
    requirements = models.TextField(default='Default course req')
    materials = models.TextField(default='Default course mat')


    price_per_hour = models.DecimalField(default=10, max_digits=10, decimal_places=2)
    price_per_dollar = models.DecimalField(default=12, max_digits=10, decimal_places=2)
    price_per_toman = models.DecimalField(default=960, max_digits=10, decimal_places=2)


    language = models.CharField(max_length=50)
    level = models.CharField(max_length=50)
    schedule_day = models.CharField(max_length=50)
    schedule_start = models.TimeField()
    schedule_end = models.TimeField()


    capacity = models.IntegerField()
    active_students = models.IntegerField(default=0)
    length = models.IntegerField(default=20)
    course_duration = models.IntegerField(default=60)


    image = models.ImageField(upload_to='course_images/', null=True, blank=True)
    language_flag = models.ImageField(upload_to='flags/', null=True, blank=True)

    def __str__(self):
        return self.title

# Lesson Model
class Lesson(models.Model):
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    lesson_video = models.URLField(null=True, blank=True)
    lesson_document = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.title

# Homework Model
class Homework(models.Model):
    lesson = models.ForeignKey(Lesson, related_name='homeworks', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    document = models.URLField(null=True, blank=True)
    due_date = models.DateField()

    def __str__(self):
        return self.title


# Review Model (for reviews from students to tutors)
class Review(models.Model):
    from students.models import Student
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE)
    review_text = models.TextField()
    rating = models.IntegerField()  # Rating out of 5
    review_date = models.DateField()

    def __str__(self):
        return f"Review by {self.student.user.first_name} for {self.tutor.user.first_name}"

# NEW: Enrollment gates course access until approved
class Enrollment(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),  # created but no proof yet
        ("pending_payment", "Pending payment"),
        ("under_review", "Under review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    student = models.ForeignKey('students.Student', related_name='enrollments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True, default="USD")  # or TOMAN, etc.
    payment_note = models.TextField(blank=True, default="")
    payment_proof = models.ImageField(upload_to='payment_proofs/', null=True, blank=True)  # bill/photo
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='enrollment_reviews'
    )

    class Meta:
        unique_together = ('student', 'course')  # one enrollment per course

    def __str__(self):
        return f"{self.student} → {self.course} [{self.status}]"


