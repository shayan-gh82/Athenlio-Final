# # tutors/serializers.py
# from rest_framework import serializers
# from .models import Tutor, TutorCertificate, TutorEducation, TutorExperience, TutorCourse
# from accounts.models import User
#
# class UserMiniSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ["id", "email", "first_name", "last_name"]
#
# class TutorCourseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TutorCourse
#         fields = "__all__"
#
# class TutorCertificateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TutorCertificate
#         fields = "__all__"
#
# class TutorEducationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TutorEducation
#         fields = "__all__"
#
# class TutorExperienceSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TutorExperience
#         fields = "__all__"
#
# class TutorSerializer(serializers.ModelSerializer):
#     user = UserMiniSerializer(read_only=True)
#     certificates = TutorCertificateSerializer(many=True, read_only=True)
#     educations = TutorEducationSerializer(many=True, read_only=True)
#     experiences = TutorExperienceSerializer(many=True, read_only=True)
#     courses=TutorCourseSerializer(many=True, read_only=True)
#
#     class Meta:
#         model = Tutor
#         fields = [
#             "id", "user", "profile_picture", "languages_spoken",
#             "country", "subjects", "phone_number", "bio",
#             "intro_video_url", "intro_video_file",
#             "certificates", "educations", "experiences","courses"
#         ]


from rest_framework import serializers
from accounts.models import User
from .models import Tutor, TutorCertificate, TutorEducation, TutorExperience, TutorCourse

# --- mini & model serializers (read output) ---
class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]

class TutorCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorCertificate
        fields = "__all__"

class TutorEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorEducation
        fields = "__all__"

class TutorExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorExperience
        fields = "__all__"

class TutorCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorCourse
        fields = "__all__"

class TutorSerializer(serializers.ModelSerializer):
    is_approved = serializers.BooleanField(read_only=True)
    # READ: nested
    user = UserMiniSerializer(read_only=True)
    certificates = TutorCertificateSerializer(many=True, read_only=True)
    educations = TutorEducationSerializer(many=True, read_only=True)
    experiences = TutorExperienceSerializer(many=True, read_only=True)
    courses = TutorCourseSerializer(many=True, read_only=True)

    # WRITE: flat fields to edit user name/email along with tutor
    user_email = serializers.EmailField(write_only=True, required=False)
    user_first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    user_last_name  = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Tutor
        fields = [
            "id",
            "is_approved",
            "user",                   # read-only nested user (id, email, names)
            "user_email", "user_first_name", "user_last_name",  # write-only fields
            "profile_picture", "languages_spoken",
            "country", "subjects", "phone_number",
            "bio", "teaching_style", "expectation", "description",
            "intro_video_url", "intro_video_file",
            "certificates", "educations", "experiences", "courses",
        ]

    def update(self, instance, validated_data):
        # Pull user props if present
        u_email = validated_data.pop("user_email", None)
        u_fn    = validated_data.pop("user_first_name", None)
        u_ln    = validated_data.pop("user_last_name", None)

        # Update Tutor fields (normal)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # Update related User fields
        user = instance.user
        changed = False
        if u_email is not None and u_email != user.email:
            user.email = u_email; changed = True
        if u_fn is not None and u_fn != user.first_name:
            user.first_name = u_fn; changed = True
        if u_ln is not None and u_ln != user.last_name:
            user.last_name = u_ln; changed = True
        if changed:
            user.save(update_fields=["email", "first_name", "last_name"])

        return instance


# --- input serializer for the one-shot create endpoint ---
class LanguageLevelSerializer(serializers.Serializer):
    language = serializers.CharField()
    level = serializers.CharField()

class CertificateInSerializer(serializers.Serializer):
    title = serializers.CharField()
    issued_by = serializers.CharField(required=False, allow_blank=True)
    issue_date = serializers.DateField(required=False, allow_null=True)
    certificate_image = serializers.ImageField(required=False, allow_null=True)

class EducationInSerializer(serializers.Serializer):
    degree = serializers.CharField()
    institution_name = serializers.CharField()
    country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    field = serializers.CharField(required=False, allow_blank=True)
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)

class ExperienceInSerializer(serializers.Serializer):
    title = serializers.CharField()
    organization = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True)

class CourseInSerializer(serializers.Serializer):
    course_title = serializers.CharField()
    duration_minutes = serializers.IntegerField()
    course_type = serializers.ChoiceField(choices=[('online', 'Online'), ('offline', 'Offline')])
    price_per_hour = serializers.DecimalField(max_digits=10, decimal_places=2)
    lesson_package = serializers.CharField()
    language = serializers.CharField()
    days_available = serializers.ListField(child=serializers.CharField(), required=False)
    time_slots = serializers.ListField(child=serializers.CharField(), required=False)
    start_date = serializers.DateField()
    description = serializers.CharField()

class CreateTutorProfileInputSerializer(serializers.Serializer):
    # step 1  ✅ make optional for page-by-page
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    phone_number = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    subjects = serializers.ListField(child=serializers.CharField())
    languages_spoken = LanguageLevelSerializer(many=True, required=False)


    def validate_subjects(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("subjects must be a list of strings.")
        return value

    # step 2
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    # step 3
    certificates = CertificateInSerializer(many=True, required=False)

    # step 4
    educations = EducationInSerializer(many=True, required=False)

    # step 5
    bio = serializers.CharField(required=False, allow_blank=True)
    teaching_style = serializers.CharField(required=False, allow_blank=True)
    expectation = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    experiences = ExperienceInSerializer(many=True, required=False)

    # step 6
    intro_video_url = serializers.URLField(required=False, allow_blank=True)
    intro_video_file = serializers.FileField(required=False, allow_null=True)

    # step 7
    courses = CourseInSerializer(many=True, required=False)
