from django.contrib import admin
from .models import CustomUser, SubscriptionPlan, UserSubscription, PaymentHistory, APIKey, AudioFile, UploadHistory, Payment, Post, Comment

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'nickname', 'company', 'contact', 'sms_marketing', 'email_marketing', 'free_credits')
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
    list_display = ('user', 'key', 'created_at', 'last_used_at')
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

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'tid', 'status', 'amount', 'created_at', 'updated_at')
    search_fields = ('user__username', 'tid')
    list_filter = ('status', 'created_at', 'updated_at')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'updated_at', 'is_notice', 'views', 'is_public')
    search_fields = ('title', 'author__username')
    list_filter = ('created_at', 'updated_at', 'is_notice', 'is_public')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_at', 'updated_at', 'is_public')
    search_fields = ('post__title', 'author__username', 'content')
    list_filter = ('created_at', 'updated_at', 'is_public')