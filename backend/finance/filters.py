import django_filters
from .models import FinancialRecord

class FinancialRecordFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name="date", lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name="date", lookup_expr='lte')

    class Meta:
        model = FinancialRecord
        fields = ['category', 'record_type', 'date']
