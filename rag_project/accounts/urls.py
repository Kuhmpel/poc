from django.urls import path
from .views import RegisterView, LoginView, VerifyOTPView, RequestVerificationView, VerifiedInfoView, conversation_history


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('request-verification/', RequestVerificationView.as_view()),
    path('verified-info/', VerifiedInfoView.as_view(), name='verified-info'),
]
