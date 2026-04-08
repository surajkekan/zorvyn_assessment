from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    VIEWER = 'viewer'
    ANALYST = 'analyst'
    ADMIN = 'admin'
    
    ROLE_CHOICES = [
        (VIEWER, 'Viewer'),
        (ANALYST, 'Analyst'),
        (ADMIN, 'Admin'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=VIEWER)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class FinancialRecord(models.Model):
    INCOME = 'income'
    EXPENSE = 'expense'
    INVESTMENT = 'investment'

    TYPE_CHOICES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
        (INVESTMENT, 'Investment'),
    ]

    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    record_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default=EXPENSE)
    date = models.DateField()
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='records')

    def __str__(self):
        return f"{self.title}: {self.amount}"
