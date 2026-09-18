from rest_framework import serializers
from .models import User
from tutors.models import Tutor
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'is_teacher']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_teacher=validated_data.get('is_teacher', False)
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email is already taken')
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)

            if user.check_password(password):
                return {"user": user}
            else:
                raise serializers.ValidationError('Invalid password')

        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email address')

class MeSerializer(serializers.ModelSerializer):
    has_tutor_profile = serializers.SerializerMethodField()
    tutor_id=serializers.SerializerMethodField()
    tutor_approved = serializers.SerializerMethodField()


    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name',
                  'is_teacher', 'profile_picture','has_tutor_profile',
                  'tutor_id', 'tutor_approved']

    def get_has_tutor_profile(self, obj):
        return hasattr(obj, 'tutor')

    def get_tutor_id(self, obj):
        tutor = getattr(obj, 'tutor',None)
        return tutor.id if tutor else None

    def get_tutor_approved(self, obj):
        tutor = getattr(obj, 'tutor',None)
        if not tutor:
            return None
        return tutor.is_approved


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)