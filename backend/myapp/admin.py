from django.contrib import admin
from .models import CustomUser, SubscriptionPlan, UserSubscription, PaymentHistory, APIKey, AudioFile, UploadHistory

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'nickname', 'company', 'contact', 'sms_marketing', 'email_marketing')
    search_fields = ('email', 'username', 'nickname', 'company', 'contact')
    list_filter = ('sms_marketing', 'email_marketing')

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'api_calls_per_day', 'credits', 'is_recurring')
    search_fields = ('name',)
    list_filter = ('is_recurring',)

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date', 'daily_credits', 'total_credits', 'is_active')
    search_fields = ('user__username', 'plan__name')
    list_filter = ('is_active', 'start_date')

@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'amount', 'payment_date', 'is_successful')
    search_fields = ('user__username', 'plan__name')
    list_filter = ('is_successful', 'payment_date')

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'created_at', 'last_used_at', 'credits')
    search_fields = ('user__username', 'key')
    list_filter = ('created_at', 'last_used_at')

@admin.register(AudioFile)
class AudioFileAdmin(admin.ModelAdmin):
    list_display = ('user', 'file_name', 'file_path', 'analysis_result', 'uploaded_at')
    search_fields = ('user__username', 'file_name')
    list_filter = ('uploaded_at',)

@admin.register(UploadHistory)
class UploadHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'upload_date', 'upload_count')
    search_fields = ('user__username',)
    list_filter = ('upload_date',)
    unique_together = ('user', 'upload_date')
