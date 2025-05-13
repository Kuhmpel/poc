from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.contrib.auth import authenticate
from datetime import timedelta
import logging

from .models import CustomUser, OTP
from .serializers import UserSerializer

otp_logger = logging.getLogger('otp')


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not request.data.get('username') or not request.data.get('password'):
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(username=request.data.get('username')).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User created. Please request verification separately.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)


from rest_framework.permissions import IsAuthenticated

class RequestVerificationView(APIView):
    permission_classes = [IsAuthenticated]  # 🔐 Auth required

    def post(self, request):
        user = request.user  # ✅ Authenticated user only

        # Optional: Prevent rapid re-requests
        recent_otp = OTP.objects.filter(
            user=user, is_used=False,
            created_at__gte=timezone.now() - timedelta(minutes=5)
        ).first()

        if recent_otp:
            return Response({'error': 'OTP recently requested. Please wait.'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Optional user data update (e.g. address)
        updatable_fields = ['email', 'first_name', 'last_name', 'address_line1',
                            'address_line2', 'city', 'state', 'zip_code']
        for field in updatable_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        # Generate and log OTP
        otp = OTP.objects.create(user=user)
        otp_logger.info(f'OTP for {user.username}: {otp.code}')

        return Response({'message': 'OTP generated and will be sent via mail.'}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [IsAuthenticated]  # 🔐 Auth required

    def post(self, request):
        code = request.data.get('otp')
        user = request.user  # ✅ Get from token

        if not code:
            return Response({'error': 'OTP code is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp = OTP.objects.filter(user=user, code=code, is_used=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        if otp.expires_at < timezone.now():
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.save()
        otp.is_used = True
        otp.save()

        return Response({'message': 'OTP verified successfully', 'person_id': user.id}, status=status.HTTP_200_OK)