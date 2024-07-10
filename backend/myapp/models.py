from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings

class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, unique=False)
    email = models.EmailField(unique=True)
    company = models.CharField(max_length=100, blank=True)
    contact = models.CharField(max_length=15, blank=True)
    nickname = models.CharField(max_length=50, blank=True)
    consent_personal_info = models.BooleanField(default=False)
    consent_service_terms = models.BooleanField(default=False)
    consent_voice_data = models.BooleanField(default=False)
    sms_marketing = models.BooleanField(default=False)
    email_marketing = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
class SubscriptionPlan(models.Model):
    PLAN_CHOICES = [
        ('Pay As You Go', 'Pay As You Go'),
        ('BASIC', 'Basic'),
        ('ASSOCIATE', 'Associate'),
        ('PROFESSIONAL', 'Professional'),
    ]
    name = models.CharField(max_length=20, choices=PLAN_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    api_calls_per_day = models.IntegerField(null=True, blank=True)
    credits = models.IntegerField(null=True, blank=True)
    is_recurring = models.BooleanField(default=False)
    description = models.TextField(default="")

    def __str__(self):
        return self.name

class UserSubscription(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    daily_credits = models.IntegerField(default=0)
    total_credits = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"

class PaymentHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    is_successful = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan.name} - {self.amount}"
    
class Payment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    tid = models.CharField(max_length=100, unique=True)
    partner_order_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='initiated')
    approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} - {self.plan} - {self.tid}"

class APIKey(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    key = models.CharField(max_length=32, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    credits = models.IntegerField(default=10)

    def __str__(self):
        return self.key

class AudioFile(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    file_extension = models.CharField(max_length=10)
    analysis_result = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def str(self):
        return self.file_name

class UploadHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    upload_date = models.DateField()
    upload_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'upload_date')

    def __str__(self):
        return f"{self.user.email} - {self.upload_date}: {self.upload_count} uploads"

class Post(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_notice = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    views = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=True)

    def __str__(self):
        return self.content