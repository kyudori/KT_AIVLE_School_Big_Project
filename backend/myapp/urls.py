from django.urls import path
from .views import signup, login, find_id, reset_password, confirm_delete_account, user_info, change_password, current_plan, subscription_plans, upload_audio, upload_youtube, get_api_key, generate_api_key, regenerate_api_key, delete_api_key, toggle_api_status, get_credits, user_files, delete_account, subscription_plans, create_payment, approve_payment, cancel_payment, fail_payment, posts_list_create, post_detail, create_comment, comment_detail, user_posts, user_comments, check_api_status, voice_verity, youtube_verity, call_history, call_summary


urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('reset-password/', reset_password, name='reset_password'),
    path('find-id/', find_id, name='find_id'),
    path('user-info/', user_info, name='user_info'),
    path('change-password/', change_password, name='change_password'),
    path('upload-audio/', upload_audio, name='upload_audio'),
    path('upload-youtube/', upload_youtube, name='upload_youtube'),
    path('subscription_plans/', subscription_plans, name='subscription_plans'),
    path('get-api-key/', get_api_key, name='get_api_key'),
    path('generate-api-key/', generate_api_key, name='generate_api_key'),
    path('regenerate-api-key/', regenerate_api_key, name='regenerate_api_key'),
    path('delete-api-key/', delete_api_key, name='delete_api_key'),
    path('toggle-api-status/', toggle_api_status, name='toggle_api_status'),
    path('get-credits/', get_credits, name='get_credits'),
    # path('validate-key/', validate_key, name='validate_key'),
    # path('api-usage-weekly/', api_usage_weekly),
    # path('group-usage/', group_usage),
    path('user-files/', user_files),
    path('confirm-delete-account/', confirm_delete_account, name='confirm_delete_account'),
    path('delete-account/', delete_account, name='delete_account'),
    path('current-plan/', current_plan, name='current_plan'),
    path('subscription-plans/', subscription_plans, name='subscription_plans'),
    path('payments/create/', create_payment, name='create_payment'),
    path('payments/approval/', approve_payment, name='approve_payment'),
    path('payments/cancel/', cancel_payment, name='cancel_payment'),
    path('payments/fail/', fail_payment, name='fail_payment'),
    path('posts/', posts_list_create, name='posts_list_create'),
    path('posts/<int:pk>/', post_detail, name='post_detail'),
    path('posts/<int:post_pk>/comments/', create_comment, name='create_comment'),
    path('comments/<int:pk>/', comment_detail, name='comment_detail'),
    path('user/posts/', user_posts, name='user_posts'),
    path('user/comments/', user_comments, name='user_comments'),
    path('check-api-status/', check_api_status, name='check-api-status'),
    path('voice-verity/', voice_verity, name='voice-verity'),
    path('youtube-verity/', youtube_verity, name='youtube-verity'),
    path('call-history/', call_history, name='call-history'),
    path('call-summary/', call_summary, name='call-summary'),
]
