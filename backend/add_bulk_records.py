import os
import django
import datetime
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zorvyn_project.settings')
django.setup()

from finance.models import User, FinancialRecord

def seed_bulk(count=100):
    admin = User.objects.filter(username='admin').first()
    if not admin:
        print("Admin user not found. Please run seed_data.py first.")
        return

    categories = {
        'income': ['Salary', 'Freelance', 'Dividends', 'Gift', 'Refund'],
        'expense': ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Dining', 'Transportation', 'Healthcare', 'Insurance'],
        'investment': ['Stocks', 'Bonds', 'Crypto', 'Real Estate']
    }
    
    types = ['income', 'expense', 'investment']
    
    today = datetime.date.today()
    created_count = 0

    for i in range(count):
        rtype = random.choice(types)
        cat = random.choice(categories[rtype])
        amount = round(random.uniform(10.0, 5000.0), 2)
        if rtype == 'income':
            amount = round(random.uniform(500.0, 10000.0), 2)
        
        days_ago = random.randint(0, 60)
        date = today - datetime.timedelta(days=days_ago)
        
        title = f"{cat} - {date.strftime('%b %d')}"
        
        FinancialRecord.objects.create(
            title=title,
            amount=amount,
            record_type=rtype,
            category=cat,
            date=date,
            created_by=admin,
            description=f"Automated bulk entry for {cat}"
        )
        created_count += 1

    print(f"Successfully added {created_count} transactions.")

if __name__ == '__main__':
    seed_bulk(100)
