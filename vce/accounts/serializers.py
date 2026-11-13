from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "school") 

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.pop('password', None)
        return ret
    
class RegisterSerializer(serializers.ModelSerializer):
    referral_code = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        max_length=20,
    )

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'school', 'referral_code')
        extra_kwargs = {
            'password': {'write_only': True},
            'school': {'required': True}
        }

    def validate_referral_code(self, value):
        code = value.strip().upper()
        if code and not ReferralCode.objects.filter(code__iexact=code).exists():
            raise serializers.ValidationError("This referral code is not valid.")
        return code

    @transaction.atomic
    def create(self, validated_data):
        referral_code = validated_data.pop('referral_code', '')
        user = User.objects.create_user(**validated_data)
        if referral_code:
            code = ReferralCode.objects.select_related('user').get(
                code__iexact=referral_code
            )
            Referral.objects.create(
                referrer=code.user,
                referred_user=user,
                code_used=code.code,
            )
        return user
