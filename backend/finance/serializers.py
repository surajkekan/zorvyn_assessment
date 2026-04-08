from rest_framework import serializers
from .models import User, FinancialRecord
from django.db.models import Sum

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'is_active')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role')

    def validate_password(self, value):
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class FinancialRecordSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = FinancialRecord
        fields = '__all__'
        read_only_fields = ('created_by',)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Transaction amount must be strictly positive.")
        return value

    def validate_date(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Transaction date cannot be in the future.")
        return value

    def validate(self, data):
        """
        Object-level validation for cross-field consistency.
        """
        if data.get('record_type') == 'expense' and data.get('category') == 'Salary':
            raise serializers.ValidationError({
                "category": "Salary is typically an Income category, not an Expense."
            })
        return data

class AnalyticsSummarySerializer(serializers.Serializer):
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    record_count = serializers.IntegerField()
    by_category = serializers.DictField()
