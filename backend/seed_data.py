import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zorvyn_project.settings')
django.setup()

from finance.models import User, FinancialRecord

def seed():
    # Create Admin
    admin, created = User.objects.get_or_create(
        username='admin',
        email='admin@example.com',
        role='admin',
        is_staff=True,
        is_superuser=True
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print("Admin user created: admin / admin123")

    # Create Analyst
    analyst, created = User.objects.get_or_create(
        username='analyst',
        email='analyst@example.com',
        role='analyst'
    )
    if created:
        analyst.set_password('analyst123')
        analyst.save()
        print("Analyst user created: analyst / analyst123")

    # Create Viewer
    viewer, created = User.objects.get_or_create(
        username='viewer',
        email='viewer@example.com',
        role='viewer'
    )
    if created:
        viewer.set_password('viewer123')
        viewer.save()
        print("Viewer user created: viewer / viewer123")

    # Create Mock Records
    records_data = [
        {'title': 'Q1 Revenue', 'amount': 50000.00, 'category': 'Revenue', 'date': datetime.date(2024, 1, 15)},
        {'title': 'Office Rent', 'amount': 2500.00, 'category': 'Expense', 'date': datetime.date(2024, 2, 1)},
        {'title': 'Cloud Hosting', 'amount': 450.00, 'category': 'Expense', 'date': datetime.date(2024, 2, 10)},
        {'title': 'Consulting Fee', 'amount': 12000.00, 'category': 'Revenue', 'date': datetime.date(2024, 2, 25)},
        {'title': 'Hardware Purchase', 'amount': 8000.00, 'category': 'Investment', 'date': datetime.date(2024, 3, 5)},
    ]

    for data in records_data:
        record, created = FinancialRecord.objects.get_or_create(
            title=data['title'],
            defaults={
                'amount': data['amount'],
                'category': data['category'],
                'date': data['date'],
                'created_by': admin
            }
        )
        if created:
            print(f"Created record: {data['title']}")

if __name__ == '__main__':
    seed()
