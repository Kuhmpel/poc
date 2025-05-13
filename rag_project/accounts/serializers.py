from rest_framework import serializers
from .models import CustomUser, OTP, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'password', 'address_line1', 'address_line2',
            'city', 'state', 'zip_code', 'is_verified'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
            address_line1=validated_data.get('address_line1', ''),
            address_line2=validated_data.get('address_line2', ''),
            city=validated_data.get('city', ''),
            state=validated_data.get('state', ''),
            zip_code=validated_data.get('zip_code', ''),
        )
        UserProfile.objects.create(user=user, context={})
        return user

