# myapp/tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import datetime, date
from myapp.models import CustomUser, UserSubscription

@shared_task
def reset_daily_credits():
    today = timezone.now().date()
    subscriptions = UserSubscription.objects.filter(is_active=True)

    for subscription in subscriptions:
        if subscription.plan.is_recurring:
            subscription.daily_credits = subscription.plan.api_calls_per_day
            subscription.save()

    return f'Daily credits reset for {subscriptions.count()} subscriptions.'

@shared_task
def expire_general_credits():
    today = timezone.now().date()
    subscriptions = UserSubscription.objects.filter(plan__is_recurring=False, is_active=True)

    for subscription in subscriptions:
        if subscription.end_date:
            # subscription.end_date가 datetime일 경우 date로 변환
            if isinstance(subscription.end_date, datetime):
                subscription_end_date = subscription.end_date.date()
            else:
                subscription_end_date = subscription.end_date
            
            if subscription_end_date <= today:
                subscription.is_active = False
                subscription.save()

    return f'Expired general credits for {subscriptions.count()} subscriptions.'

@shared_task
def reset_free_credits():
    users = CustomUser.objects.all()

    for user in users:
        user.free_credits = 5
        user.save()

    return f'Free credits reset for {users.count()} users.'
