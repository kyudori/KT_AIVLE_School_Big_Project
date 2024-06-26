from django.contrib import admin
from .models import APIKey, CustomUser

class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'credits', 'created_at', 'last_used_at')
    search_fields = ('user__email', 'key')

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'company', 'contact', 'is_staff')
    search_fields = ('email', 'username')

admin.site.register(APIKey, APIKeyAdmin)
admin.site.register(CustomUser, CustomUserAdmin)
