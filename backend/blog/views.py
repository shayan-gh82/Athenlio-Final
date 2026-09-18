from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Blog
from .serializers import BlogSerializer
from drf_spectacular.utils import extend_schema


@extend_schema(
    responses={200: BlogSerializer(many=True)},  # Use 'many=True' for a list of blogs
    description='Retrieve a list of blogs or create a new blog.'
)
class BlogListCreateView(generics.ListCreateAPIView):
    queryset = Blog.objects.order_by('-created_at')
    serializer_class = BlogSerializer
    permission_classes = [AllowAny]
    pagination_class = None # optional: removes pagination to show ALL blogs

@extend_schema(
    responses={200: BlogSerializer},  # Single Blog response
    description='Retrieve, update or delete a specific blog by ID.'
)
class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [AllowAny]
