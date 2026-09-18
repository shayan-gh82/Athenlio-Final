# In students/models.py
from django.db import models
from courses.models import Course  # Import Course model
from accounts.models import User  # Import User model
from tutors.models import Tutor

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')  # Changed related_name
    courses_list = models.ManyToManyField(Course, related_name='students_list')  # Changed related_name
    favourite_tutors = models.ManyToManyField(Tutor, related_name="favorite_students_students", blank=True)
    student_active = models.BooleanField(default=True)
    student_homework_completed = models.JSONField(default=list)
    messages_received = models.JSONField(default=list, blank=True, null=True)
    messages_sent = models.JSONField(default=list, blank=True, null=True)
    reviews = models.JSONField(default=list, blank=True, null=True)
    student_homework_sent = models.JSONField(default=list, blank=True, null=True)

    def __str__(self):
        return self.user.first_name
