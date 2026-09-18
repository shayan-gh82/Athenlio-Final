from rest_framework import serializers
from .models import Blog, Category

class BlogSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False)

    class Meta:
        model = Blog
        fields = [
            'id',
            'title',
            'author',
            'description',
            'content',
            'category',
            'difficulty_level',
            'featured',
            'created_at',
            'updated_at',
            'picture',
        ]

