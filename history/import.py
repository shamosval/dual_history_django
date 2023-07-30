import csv
import os
import django

# Set the DJANGO_SETTINGS_MODULE environment variable

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'history.settings')

# Initialize Django
django.setup()

from dual.models import Event

csv_file = "csv/russia.csv"

with open(csv_file, 'r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        important_value = row['important'].lower()
        important = (important_value == 'yes')
        
        event = Event.objects.create(
            year=int(row['year']),
            title=row['title'],
            description=row['description'],
            important=important,
            keywords=row.get('keywords', ''),
            link=row.get('link', ''),
            image=row.get('image', ''),
            country=row.get('country', '')
        )

print('CSV file imported successfully.')
