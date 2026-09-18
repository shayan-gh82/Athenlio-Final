from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "first_name", "last_name", "is_teacher", "is_staff")
    list_filter = ("is_teacher", "is_staff", "is_superuser")
    search_fields = ("email", "first_name", "last_name")
