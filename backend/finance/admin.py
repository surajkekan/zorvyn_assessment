from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, FinancialRecord

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )

@admin.register(FinancialRecord)
class FinancialRecordAdmin(admin.ModelAdmin):
    list_display = ('title', 'amount', 'record_type', 'category', 'date', 'created_by')
    list_filter = ('record_type', 'category', 'date', 'created_by')
    search_fields = ('title', 'category', 'description')
    date_hierarchy = 'date'

admin.site.register(User, CustomUserAdmin)
