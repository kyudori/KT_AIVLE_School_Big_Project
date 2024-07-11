# backend/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'reset-daily-credits-every-day': {
        'task': 'myapp.tasks.reset_daily_credits',
        'schedule': crontab(hour=0, minute=0),
    },
    'expire-general-credits-every-day': {
        'task': 'myapp.tasks.expire_general_credits',
        'schedule': crontab(hour=0, minute=0),
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
