from django.urls import path
from .views import signup, login, find_id, reset_password, user_info, change_password, upload_audio, get_api_key, regenerate_api_key, delete_api_key, get_credits, validate_key, api_usage_weekly, group_usage, user_files

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('reset-password/', reset_password, name='reset_password'),
    path('find-id/', find_id, name='find_id'),
    path('user-info/', user_info, name='user_info'),
    path('change-password/', change_password, name='change_password'),
    path('upload-audio/', upload_audio, name='upload_audio'),
    path('get-api-key/', get_api_key, name='get_api_key'),
    path('regenerate-api-key/', regenerate_api_key, name='regenerate_api_key'),
    path('delete-api-key/', delete_api_key, name='delete_api_key'),
    path('get-credits/', get_credits, name='get_credits'),
    path('validate-key/', validate_key, name='validate_key'),
    path('api-usage-weekly/', api_usage_weekly),
    path('group-usage/', group_usage),
    path('user-files/', user_files),
]
