from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

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
    analysis_result = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name

class UploadHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    upload_date = models.DateField()
    upload_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'upload_date')

    def __str__(self):
        return f"{self.user.email} - {self.upload_date}: {self.upload_count} uploads"
