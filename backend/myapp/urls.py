from django.urls import path
from .views import signup, login, find_id, reset_password, user_info, change_password, upload_audio, get_api_key, regenerate_api_key, delete_api_key, toggle_api_status, get_credits, validate_key, api_usage_weekly, group_usage, user_files, delete_account, subscription_plans, create_payment, approve_payment, cancel_payment, fail_payment, posts_list_create, post_detail, create_comment, comment_detail, user_posts, user_comments


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
    path('toggle-api-status/', toggle_api_status, name='toggle_api_status'),
    path('get-credits/', get_credits, name='get_credits'),
    path('validate-key/', validate_key, name='validate_key'),
    path('api-usage-weekly/', api_usage_weekly),
    path('group-usage/', group_usage),
    path('user-files/', user_files),
    path('delete-account/', delete_account, name='delete_account'),
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
]
