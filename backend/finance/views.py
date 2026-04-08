import logging
from django.db.models import Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .models import User, FinancialRecord
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    FinancialRecordSerializer
)
from .permissions import IsAdminUser, IsAnalystOrAdmin, IsViewerOrAbove
from .filters import FinancialRecordFilter

logger = logging.getLogger(__name__)

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email']

    def get_queryset(self):
        return super().get_queryset()

    def perform_destroy(self, instance):
        if instance == self.request.user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You cannot delete your own account.")
        instance.delete()

    def perform_update(self, serializer):
        if serializer.instance == self.request.user and serializer.validated_data.get('is_active') is False:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You cannot deactivate your own account.")
        serializer.save()

class FinancialRecordViewSet(viewsets.ModelViewSet):
    queryset = FinancialRecord.objects.all()
    serializer_class = FinancialRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = FinancialRecordFilter
    search_fields = ['title', 'description', 'category']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [IsAnalystOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AnalyticsSummaryView(APIView):
    permission_classes = [IsViewerOrAbove]

    def get(self, request):
        records = FinancialRecord.objects.all()
        
        income_total = records.filter(record_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        expense_total = records.filter(record_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        investment_total = records.filter(record_type='investment').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Trends (last 30 days daily)
        trends_data = (
            records.values('date', 'record_type')
            .annotate(total=Sum('amount'))
            .order_by('date')
        )
        
        trends = {}
        for item in trends_data:
            date_str = item['date'].isoformat()
            if date_str not in trends:
                trends[date_str] = {'income': 0, 'expense': 0, 'investment': 0}
            trends[date_str][item['record_type']] = float(item['total'])

        summary = {
            'total_amount': income_total - expense_total, # Net balance
            'total_income': income_total,
            'total_expenses': expense_total,
            'total_investments': investment_total,
            'record_count': records.count(),
            'by_category': {
                item['category']: item['total'] 
                for item in records.values('category').annotate(total=Sum('amount'))
            },
            'by_type': {
                item['record_type']: item['total'] 
                for item in records.values('record_type').annotate(total=Sum('amount'))
            },
            'trends': [
                {'date': d, **v} for d, v in sorted(trends.items())
            ]
        }
        return Response(summary)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
