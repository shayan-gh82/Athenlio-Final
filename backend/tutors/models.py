# # tutors/models.py  (keep this file exactly like this)
# from django.db import models
# from accounts.models import User
#
#
#
# class Tutor(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="tutor")
#     profile_picture = models.ImageField(upload_to="tutor_photos/", null=True, blank=True)
#
#     # arrays
#     languages_spoken = models.JSONField(default=list, blank=True)  # e.g. [{"language":"English","level":"B2"}]
#     subjects = models.JSONField(default=list, blank=True)
#
#     # basics
#     country = models.CharField(max_length=80, blank=True, default="")
#     phone_number = models.CharField(max_length=20, blank=True, default="")
#
#     # about
#     bio = models.TextField(blank=True, default="")
#     teaching_style = models.TextField(blank=True, default="")
#     expectation = models.TextField(blank=True, default="")
#     description = models.TextField(blank=True, default="")
#
#     # intro video
#     intro_video_url = models.URLField(blank=True, default="")
#     intro_video_file = models.FileField(upload_to="tutor_videos/", null=True, blank=True)
#
#     def __str__(self):
#         return f"{self.user.first_name} {self.user.last_name}"
#
# class TutorCertificate(models.Model):
#     tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="educations")
#     degree = models.CharField(max_length=120)
#     institution_name = models.CharField(max_length=200)
#     country = models.CharField(max_length=80, blank=True, default="")
#     city = models.CharField(max_length=120, blank=True, default="")
#     field = models.CharField(max_length=200, blank=True, default="")
#     start_date = models.DateField(null=True, blank=True)
#     end_date = models.DateField(null=True, blank=True)
#
#     def __str__(self):
#         return f"{self.title} — {self.tutor}"
#
#
# class TutorCourse(models.Model):
#     tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="certificates")
#     title = models.CharField(max_length=200)
#     issued_by = models.CharField(max_length=200, blank=True, default="")
#     issue_date = models.DateField(null=True, blank=True)
#     certificate_image = models.ImageField(upload_to="certificates/", null=True, blank=True)
#
#     def __str__(self):
#         return f"{self.course_title} by {self.tutor.user.first_name} {self.tutor.user.last_name}"
#
#
#
# class TutorEducation(models.Model):
#     tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="educations")
#     degree = models.CharField(max_length=120)
#     institution_name = models.CharField(max_length=200)
#     country = models.CharField(max_length=80, blank=True, default="")
#     city = models.CharField(max_length=120, blank=True, default="")
#     field = models.CharField(max_length=200, blank=True, default="")
#     start_date = models.DateField(null=True, blank=True)
#     end_date = models.DateField(null=True, blank=True)
#
#     def __str__(self):
#         return f"{self.degree} @ {self.institution_name}"
#
# class TutorExperience(models.Model):
#     tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="experiences")
#     title = models.CharField(max_length=200)
#     organization = models.CharField(max_length=200, blank=True, default="")
#     country = models.CharField(max_length=80, blank=True, default="")
#     city = models.CharField(max_length=120, blank=True, default="")
#     start_date = models.DateField(null=True, blank=True)
#     end_date = models.DateField(null=True, blank=True)
#     description = models.TextField(blank=True, default="")
#
#     def __str__(self):
#         return f"{self.title} — {self.tutor}"
#
#
# class TutorCourse(models.Model):
#     tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="courses")
#     course_title = models.CharField(max_length=200)
#     duration_minutes = models.IntegerField()
#     course_type = models.CharField(max_length=10, choices=[('online', 'Online'), ('offline', 'Offline')])
#     price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
#     lesson_package = models.CharField(max_length=100)  # e.g. "10 lessons"
#     language = models.CharField(max_length=50)
#     days_available = models.JSONField(default=list, blank=True)  # e.g. ["mon","tue"]
#     time_slots = models.JSONField(default=list, blank=True)      # e.g. ["8-10","10-12"]
#     start_date = models.DateField()
#     description = models.TextField()
#
#     def __str__(self):
#         return f"{self.course_title} by {self.tutor}"


from django.db import models
from accounts.models import User

class Tutor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="tutor")

    #step1
    profile_picture = models.ImageField(upload_to="tutor_photos/", null=True, blank=True)
    # arrays
    languages_spoken = models.JSONField(default=list, blank=True)  # e.g. [{"language":"English","level":"B2"}]
    subjects = models.JSONField(default=list, blank=True)
    # basics
    country = models.CharField(max_length=80, blank=True, default="")
    phone_number = models.CharField(max_length=20, blank=True, default="")

    is_approved = models.BooleanField(default=False)

    #step5
    # about
    bio = models.TextField(blank=True, default="")
    teaching_style = models.TextField(blank=True, default="")
    expectation = models.TextField(blank=True, default="")
    #description = models.TextField(blank=True, default="")
    description = models.TextField(blank=True, default="")

    #step6
    # intro video
    intro_video_url = models.URLField(blank=True, default="")
    intro_video_file = models.FileField(upload_to="tutor_videos/", null=True, blank=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.email


class TutorCertificate(models.Model):
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="certificates")
    title = models.CharField(max_length=200)
    issued_by = models.CharField(max_length=200, blank=True, default="")
    issue_date = models.DateField(null=True, blank=True)
    certificate_image = models.ImageField(upload_to="certificates/", null=True, blank=True)

    def __str__(self):
        return f"{self.title} — {self.tutor}"


class TutorEducation(models.Model):
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="educations")
    degree = models.CharField(max_length=120)
    institution_name = models.CharField(max_length=200)
    country = models.CharField(max_length=80, blank=True, default="")
    city = models.CharField(max_length=120, blank=True, default="")
    field = models.CharField(max_length=200, blank=True, default="")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.degree} @ {self.institution_name}"


class TutorExperience(models.Model):
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="experiences")
    title = models.CharField(max_length=200)
    organization = models.CharField(max_length=200, blank=True, default="")
    country = models.CharField(max_length=80, blank=True, default="")
    city = models.CharField(max_length=120, blank=True, default="")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.title} — {self.tutor}"


class TutorCourse(models.Model):
    ONLINE_OFFLINE= (('online', 'online'),('offline', 'offline'))

    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name="courses")
    course_title = models.CharField(max_length=200)
    duration_minutes = models.IntegerField()
    course_type = models.CharField(max_length=10, choices=[('online', 'Online'), ('offline', 'Offline')])
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    lesson_package = models.CharField(max_length=100)  # e.g. "10 lessons"
    language = models.CharField(max_length=50)
    days_available = models.JSONField(default=list, blank=True)  # e.g. ["mon","tue"]
    time_slots = models.JSONField(default=list, blank=True)      # e.g. ["8-10","10-12"]
    start_date = models.DateField()
    description = models.TextField()


    def __str__(self):
        return f"{self.course_title} by {self.tutor}"
