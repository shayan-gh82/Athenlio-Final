# students/serializers.py
from rest_framework import serializers


from .models import Student
from accounts.models import User
from courses.models import Course
from tutors.models import Tutor

class StudentSerializer(serializers.ModelSerializer):
    courses_list = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True, required=False, allow_empty=True)
    favourite_tutors  = serializers.PrimaryKeyRelatedField(queryset=Tutor.objects.all(), many=True, required=False, allow_empty=True)
    class Meta:
        model = Student
        fields = ['id', 'user', 'courses_list', 'favourite_tutors', 'student_active', 'student_homework_completed']

    def create(self, validated_data):
        courses= validated_data.pop('courses_list',[])
        favs= validated_data.pop('favourite_tutors',[])
        student = Student.objects.create(**validated_data)
        if courses:
            student.courses_list.set(courses)
        if favs:
            student.favourite_tutors.set(favs)
        return student






class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    courses_list = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        many=True,
        required=False
    )
    class Meta:
        model = Student
        fields = ['favourite_tutors','courses_list', 'student_active', 'student_homework_completed', 'messages_received',
                  'messages_sent', 'reviews', 'student_homework_sent']
        extra_kwargs = {
            'favourite_tutors': {'required': False},
            'student_active': {'required': False},
            'student_homework_completed': {'required': False},
            'messages_received': {'required': False},
            'messages_sent': {'required': False},
            'reviews': {'required': False},
            'student_homework_sent': {'required': False},
        }

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'bio', 'profile_picture']
        extra_kwargs = {f: {'required': False, 'allow_null': True} for f in fields}


class StudentProfileReadSerializer(serializers.Serializer):
    user = UserProfileUpdateSerializer(read_only=True)
    student = StudentSerializer(read_only=True)


class CombinedStudentProfileUpdateSerializer(serializers.ModelSerializer):
    user = UserProfileUpdateSerializer(read_only=False)
    student = StudentProfileUpdateSerializer(read_only=False)

    def update(self, instance, validated_data):


        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user_serializer = UserProfileUpdateSerializer(instance.user, data=user_data, partial=True)

            if user_serializer.is_valid():
                user_serializer.save()


            if "student" in validated_data:
                student_data = validated_data.pop('student')
                student_serializer = StudentProfileUpdateSerializer(instance, data=student_data, partial=True)

                if student_serializer.is_valid():
                    student_serializer.save()

            return instance
