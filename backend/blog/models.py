from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"  # Set plural name to "Categories"

class Blog(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=100)
    description = models.TextField()
    content = models.TextField()  # Full content of the blog
    category = models.CharField(max_length=100, blank=True, null=True)
    difficulty_level = models.CharField(max_length=50, choices=[('Easy', 'Easy'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')], default='Easy')
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    picture = models.ImageField(upload_to='blog_pictures/', blank=True, null=True)
    related_links = models.URLField(blank=True, null=True)
    reading_time = models.CharField(max_length=10, blank=True, null=True)  # Estimated reading time

    def __str__(self):
        return self.title

