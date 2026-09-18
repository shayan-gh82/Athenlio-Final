# accounts/urls.py

from django.urls import path
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    ProtectedView,
    CookieTokenRefreshView,
    MeView,
    LogoutView,
    ForgotPasswordView,
    ResetPasswordView,

)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path("protected/", ProtectedView.as_view(), name="protected"),
    path("me/", MeView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="logout"),

]
