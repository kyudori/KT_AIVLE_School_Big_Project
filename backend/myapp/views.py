# views.py (myapp/views.py)

import os
import random
import string
import json
from datetime import timedelta
from django.contrib.auth import get_user_model, authenticate
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from .models import AudioFile, UploadHistory, APIKey, SubscriptionPlan, UserSubscription, PaymentHistory, Payment, Post, Comment
from .serializers import PostSerializer, CommentSerializer
from django.db import models 
import requests
from datetime import date
from django.utils import timezone
from dotenv import load_dotenv
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from django.shortcuts import redirect, render
import logging
import uuid
import boto3
from rest_framework.pagination import PageNumberPagination
from urllib.parse import urlencode
from django.contrib.auth import login as django_login

User = get_user_model()

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def signup(request):
    data = request.data
    print(data)  # 디버깅용 로그
    if User.objects.filter(email=data['email']).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(
        username=data['username'],
        password=data['password'],
        email=data['email'],
        company=data.get('company', ''),
        contact=data.get('contact', ''),
        nickname=data.get('nickname', ''),
        consent_personal_info=data.get('consent_personal_info', False),
        consent_service_terms=data.get('consent_service_terms', False),
        consent_voice_data=data.get('consent_voice_data', False),
    )
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()
    return Response({'status': 'Account deleted successfully'}, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = request.data
    user = authenticate(username=data['email'], password=data['password'])
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        
        # django_login 함수는 Django HttpRequest 객체를 필요로 함
        django_login(request._request, user)  # 사용자 세션 설정

        return Response({'token': token.key})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def reset_password(request):
    data = request.data
    try:
        user = User.objects.get(email=data['email'], username=data['username'], contact=data['contact'])
        if user.check_password(data['password']):
            return Response({'error': 'New password cannot be the same as the current password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(data['password'])
        user.save()
        return Response({'status': 'password set'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def find_id(request):
    data = request.data
    try:
        users = User.objects.filter(username=data['username'], contact=data['contact'])
        if users.exists():
            user_data = [{'email': user.email, 'date_joined': user.date_joined} for user in users]
            return Response({'users': user_data})
        else:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from .models import CustomUser
from rest_framework import status
import os

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    if request.method == 'GET':
        if user.profile_image:
            profile_image_url = os.path.join(settings.MEDIA_URL, str(user.profile_image))
        else:
            profile_image_url = None
        return Response({
            'email': user.email,
            'username': user.username,
            'nickname': user.nickname,
            'company': user.company,
            'contact': user.contact,
            'sms_marketing': user.sms_marketing,
            'email_marketing': user.email_marketing,
            'profile_image_url': profile_image_url,
            'is_staff': user.is_staff,
        })
    elif request.method == 'PUT':
        user.nickname = request.data.get('nickname', user.nickname)
        user.company = request.data.get('company', user.company)
        user.contact = request.data.get('contact', user.contact)
        user.sms_marketing = request.data.get('sms_marketing') in ['true', True, '1', 1]
        user.email_marketing = request.data.get('email_marketing') in ['true', True, '1', 1]
        if 'profile_image' in request.FILES:
            profile_image = request.FILES['profile_image']
            # Save the image to local storage
            fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'profile_images'))
            filename = fs.save(profile_image.name, profile_image)
            user.profile_image = os.path.join('profile_images', filename)
        user.save()
        return Response({'status': 'Profile updated successfully'})

@api_view(['POST'])
def change_password(request):
    data = request.data
    user = request.user

    if not user.check_password(data['current_password']):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    if data['current_password'] == data['new_password']:
        return Response({'error': 'New password cannot be the same as the current password'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(data['new_password'])
    user.save()
    return Response({'status': 'Password changed successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_plans(request):
    plans = SubscriptionPlan.objects.filter(is_recurring=True)  # 정기 결제 플랜만 필터링
    plans_data = [
        {
            'id': plan.id,
            'name': plan.name,
            'price': plan.price,
            'api_calls_per_day': plan.api_calls_per_day,
            'credits': plan.credits,
            'is_recurring': plan.is_recurring,
            'description': plan.description
        } for plan in plans
    ]
    return Response(plans_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_plan(request):
    user = request.user
    current_subscription = UserSubscription.objects.filter(user=user, is_active=True).first()
    if current_subscription:
        plan_data = {
            'id': current_subscription.plan.id,
            'name': current_subscription.plan.name,
            'price': current_subscription.plan.price,
            'api_calls_per_day': current_subscription.plan.api_calls_per_day,
            'credits': current_subscription.plan.credits,
            'is_recurring': current_subscription.plan.is_recurring,
            'description': current_subscription.plan.description
        }
        next_payment_date = current_subscription.end_date
    else:
        plan_data = None
        next_payment_date = None

    return Response({
        'plan': plan_data,
        'next_payment_date': next_payment_date
    }, status=status.HTTP_200_OK)

# 설정된 로거 사용
logger = logging.getLogger(__name__)

import uuid
from datetime import timedelta

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    data = request.data
    plan = get_object_or_404(SubscriptionPlan, pk=data['plan_id'])

    # 현재 유저의 활성 구독 확인
    current_subscription = UserSubscription.objects.filter(user=request.user, is_active=True).first()

    # 정기 결제 플랜인 경우, 상위 플랜을 구독 중일 때 하위 플랜 결제 방지
    if plan.is_recurring:
        if current_subscription and current_subscription.plan.price > plan.price:
            return Response({'error': 'Cannot downgrade subscription plan while an active higher plan exists.'}, status=status.HTTP_400_BAD_REQUEST)

    kakao_api_url = 'https://open-api.kakaopay.com/online/v1/payment/ready'
    headers = {
        'Authorization': f'SECRET_KEY {settings.KAKAO_DEV_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    
    # 고유한 partner_order_id 생성
    partner_order_id = f"{request.user.email}_{uuid.uuid4()}"

    payload = {
        'cid': 'TC0ONETIME',  # 테스트용 가맹점 코드
        'partner_order_id': partner_order_id,
        'partner_user_id': request.user.email,
        'item_name': plan.name,
        'quantity': 1,
        'total_amount': int(plan.price),
        'tax_free_amount': 0,
        'approval_url': 'http://voice-verity.com/plansuccess',
        'cancel_url': 'http://voice-verity.com/plancancel',
        'fail_url': 'http://voice-verity.com/planfail',
    }

    try:
        response = requests.post(kakao_api_url, headers=headers, data=json.dumps(payload))
        response_data = response.json()

        if response.status_code != 200:
            return Response({'error': 'Failed to initiate payment', 'details': response_data}, status=status.HTTP_400_BAD_REQUEST)

        # Store payment information in the database
        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            tid=response_data['tid'],
            partner_order_id=partner_order_id,
            amount=plan.price,
            status='initiated'
        )

        # 세션에 tid 저장
        request.session['tid'] = response_data['tid']
        request.session.modified = True  # 세션이 변경되었음을 명시적으로 표시
        print("Session TID:", request.session['tid'])  # 디버깅 로그

        # Return all possible redirect URLs for flexibility
        return Response({
            'next_redirect_app_url': response_data.get('next_redirect_app_url'),
            'next_redirect_mobile_url': response_data.get('next_redirect_mobile_url'),
            'next_redirect_pc_url': response_data.get('next_redirect_pc_url')
        })
    except requests.RequestException as e:
        return Response({'error': 'Failed to initiate payment', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approve_payment(request):
    user = request.user
    pg_token = request.GET.get('pg_token')
    if not pg_token:
        return Response({'error': 'pg_token is required'}, status=status.HTTP_400_BAD_REQUEST)

    # tid를 DB에서 가져오기
    payment = Payment.objects.filter(user=user, status='initiated').order_by('-created_at').first()
    if not payment:
        return Response({'error': 'Transaction ID not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    tid = payment.tid

    kakao_api_url = 'https://open-api.kakaopay.com/online/v1/payment/approve'
    headers = {
        'Authorization': f'SECRET_KEY {settings.KAKAO_DEV_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    params = {
        'cid': 'TC0ONETIME',
        'tid': tid,
        'partner_order_id': payment.partner_order_id,
        'partner_user_id': user.email,
        'pg_token': pg_token,
    }

    try:
        response = requests.post(kakao_api_url, headers=headers, data=json.dumps(params))
        response_data = response.json()

        if 'aid' not in response_data:
            return Response({'error': 'Failed to approve payment', 'details': response_data}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 결제 승인 후 결제 정보 업데이트
        payment.status = 'approved'
        payment.approved = True
        payment.save()

        if payment.plan.is_recurring:
            # 정기 결제 플랜인 경우 기존 구독 처리
            current_subscription = UserSubscription.objects.filter(user=user, is_active=True).first()
            if current_subscription:
                current_subscription.is_active = False
                current_subscription.end_date = timezone.now()
                current_subscription.save()

            # 새로운 구독 생성
            UserSubscription.objects.create(
                user=user,
                plan=payment.plan,
                daily_credits=payment.plan.api_calls_per_day,
                additional_credits=payment.plan.credits,
                start_date=timezone.now(),
                end_date=timezone.now() + timedelta(days=30)
            )
        else:
            # 단건 결제 플랜인 경우
            UserSubscription.objects.create(
                user=user,
                plan=payment.plan,
                daily_credits=0,
                additional_credits=payment.plan.credits,
                start_date=timezone.now(),
                end_date=timezone.now() + timedelta(days=90)
            )

        PaymentHistory.objects.create(user=user, plan=payment.plan, amount=payment.amount)

        return Response({
            'status': 'Payment approved successfully',
            'plan_name': payment.plan.name,
            'amount': payment.amount,
            'payment_date': payment.updated_at
        })
    except requests.RequestException as e:
        return Response({'error': 'Failed to approve payment', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cancel_payment(request):
    return redirect(f'{settings.FRONTEND_URL}/plancancel')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fail_payment(request):
    return redirect(f'{settings.FRONTEND_URL}/planfail')


load_dotenv()

FLASK_URL = 'http://220.149.235.232:8000'

ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.m4a']
MAX_FILE_SIZE_MB = 200
MAX_UPLOADS_PER_DAY = 100

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_audio(request):
    file = request.FILES.get('file')

    if not file:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

    # 파일 확장자 및 크기 검증
    file_extension = os.path.splitext(file.name)[1].lower()
    file_size_mb = file.size / (1024 * 1024)

    if file_extension not in ALLOWED_EXTENSIONS:
        return Response({'error': 'Invalid file extension. Allowed extensions are: .wav, .mp3, .m4a'}, status=status.HTTP_401_BAD_REQUEST)

    if file_size_mb > MAX_FILE_SIZE_MB:
        return Response({'error': f'File size exceeds {MAX_FILE_SIZE_MB} MB limit'}, status=status.HTTP_402_BAD_REQUEST)

    today = timezone.now().date()
    upload_history, created = UploadHistory.objects.get_or_create(user=request.user, upload_date=today)

    if upload_history.upload_count >= MAX_UPLOADS_PER_DAY:
        return Response({'error': 'You have reached the maximum number of uploads for today'}, status=status.HTTP_403_BAD_REQUEST)

    # S3에 파일 업로드
    file_path = default_storage.save(f'audio_files/{file.name}', file)
    file_url = default_storage.url(file_path)

    # AI 서버에 파일 경로 전송
    try:
        response = requests.post(f"{FLASK_URL}/predict", json={'file_path': file_url, 'data_type': 'aws', 'key_verity': True})
        response.raise_for_status()
        result = response.json().get('analysis_result', '')
        predictions = response.json().get('predictions', [])
        fake_cnt = response.json().get('fake_cnt', '')
        real_cnt = response.json().get('real_cnt', '')
    except requests.RequestException as e:
        result = "Fake (AI Server OFF, Ex Report)"
        predictions = [0.1, 0.1, 0.9, 0.9, 0.9, 0.9]
        fake_cnt = 4
        real_cnt = 2
    # DB에 저장
    audio_file = AudioFile(
        user=request.user,
        file_name=file.name,
        file_path=file_url,
        file_size=file.size,
        file_extension=file_extension,
        analysis_result=result
    )
    audio_file.save()

    # 업로드 기록 업데이트 (성공한 경우에만)
    upload_history.upload_count += 1
    upload_history.save()

    return Response({
        'file_name': file.name,
        'file_path': file_url,
        'analysis_result': result,
        'predictions': predictions,
        'real_cnt': real_cnt,
        'fake_cnt': fake_cnt
    }, status=status.HTTP_201_CREATED)
    
def generate_api_key():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_api_key(request):
    user = request.user

    if request.method == 'GET':
        try:
            api_key = APIKey.objects.get(user=user)
            last_used_at = api_key.last_used_at.strftime("%Y/%m/%d %H:%M:%S") if api_key.last_used_at else "사용한 기록이 없습니다."
            return Response({
                'api_key': api_key.key, 
                'is_active': api_key.is_active,
                'last_used_at': last_used_at
            })
        except APIKey.DoesNotExist:
            return Response({'api_key': None, 'is_active': False, 'last_used_at': "사용한 기록이 없습니다."})

    if request.method == 'POST':
        data = request.data
        if not user.check_password(data['password']):
            return Response({'error': 'Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        if not APIKey.objects.filter(user=user).exists():
            api_key = APIKey.objects.create(user=user, key=generate_api_key())
        else:
            api_key = APIKey.objects.get(user=user)

        return Response({'api_key': api_key.key, 'is_active': api_key.is_active})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_api_key(request):
    data = request.data
    user = request.user

    if not user.check_password(data['password']):
        return Response({'error': 'Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    api_key = APIKey.objects.get(user=user)
    api_key.key = generate_api_key()
    api_key.save()
    return Response({'api_key': api_key.key})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_api_key(request):
    data = request.data
    user = request.user

    if not user.check_password(data['password']):
        return Response({'error': 'Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    APIKey.objects.filter(user=user).delete()
    return Response({'status': 'API key deleted successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_api_status(request):
    user = request.user
    data = request.data

    if not user.check_password(data['password']):
        return Response({'error': 'Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        api_key = APIKey.objects.get(user=user)
        api_key.is_active = data['status']
        api_key.save()
        return Response({'status': api_key.is_active})
    except APIKey.DoesNotExist:
        return Response({'error': 'API Key not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_credits(request):
    user = request.user
    subscriptions = UserSubscription.objects.filter(user=user, is_active=True)

    # 기본적으로 제공되는 free_credits
    free_credits = user.free_credits

    # 유효한 추가 크레딧 계산 (만료되지 않은 추가 크레딧만 포함)
    today = timezone.now().date()
    valid_additional_subs = subscriptions.filter(plan__is_recurring=False, end_date__gt=today)
    total_additional_credits = sum(sub.total_credits for sub in valid_additional_subs)
    used_additional_credits = sum(sub.total_credits - sub.total_credits for sub in valid_additional_subs)

    # 유효한 일일 크레딧 계산
    total_daily_credits = sum(sub.plan.api_calls_per_day for sub in subscriptions if sub.plan.is_recurring)
    used_daily_credits = sum(sub.plan.api_calls_per_day - sub.daily_credits for sub in subscriptions if sub.plan.is_recurring)

    # 남은 크레딧 계산
    remaining_free_credits = free_credits
    remaining_daily_credits = total_daily_credits - used_daily_credits
    remaining_additional_credits = total_additional_credits - used_additional_credits

    # 전체 크레딧 계산
    total_credits = free_credits + total_daily_credits + total_additional_credits
    remaining_credits = remaining_free_credits + remaining_daily_credits + remaining_additional_credits

    return Response({
        'remaining_free_credits': remaining_free_credits,
        'remaining_daily_credits': remaining_daily_credits,
        'remaining_additional_credits': remaining_additional_credits,
        'remaining_credits': remaining_credits,
        'total_credits': total_credits
    })
    
# @csrf_exempt
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def validate_key(request):
#     api_key = request.headers.get('Authorization')
#     if not api_key:
#         return Response({'valid': False, 'error': 'Missing API key'}, status=401)

#     api_key = api_key.replace('Bearer ', '')
#     try:
#         key = APIKey.objects.get(key=api_key)
#         if key.credits <= 0:
#             return Response({'valid': False, 'error': 'Insufficient credits'}, status=401)

#         key.credits -= 1
#         key.last_used_at = timezone.now()
#         key.save()
#         return Response({'valid': True})
#     except APIKey.DoesNotExist:
#         return Response({'valid': False, 'error': 'Invalid API key'}, status=401)
    
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def api_usage_weekly(request):
#     user = request.user
#     one_week_ago = timezone.now() - timedelta(days=7)
#     history = UploadHistory.objects.filter(user=user, upload_date__gte=one_week_ago)
#     data = [{"date": h.upload_date, "count": h.upload_count} for h in history]
#     return Response(data)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def group_usage(request):
#     group_data = (
#         UploadHistory.objects
#         .values('user__company')
#         .annotate(total_uploads=models.Sum('upload_count'))
#     )
#     return Response(group_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_files(request):
    user = request.user
    files = AudioFile.objects.filter(user=user)
    data = [{"file_name": f.file_name, "file_path": f.file_path, "result": f.analysis_result} for f in files]
    return Response(data)

class PostPagination(PageNumberPagination):
    page_size = 10

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def posts_list_create(request):
    if request.method == 'GET':
        paginator = PostPagination()
        posts = Post.objects.all().order_by('-is_notice', '-created_at')
        result_page = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        data = request.data
        serializer = PostSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if post.is_public or (request.user.is_authenticated and (request.user == post.author or request.user.is_staff)):
            post.views += 1
            post.save()
            serializer = PostSerializer(post)
            return Response(serializer.data)
        else:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        if not request.user.is_authenticated or (request.user != post.author and not request.user.is_staff):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        serializer = PostSerializer(post, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        if not request.user.is_authenticated or (request.user != post.author and not request.user.is_staff):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, post_pk):
    try:
        post = Post.objects.get(pk=post_pk)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data
    serializer = CommentSerializer(data=data, context={'request': request, 'post_id': post_pk})
    if serializer.is_valid():
        serializer.save(author=request.user, post=post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def comment_detail(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PUT':
        if request.user != comment.author and not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        serializer = CommentSerializer(comment, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        if request.user != comment.author and not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_posts(request):
    user = request.user
    posts = Post.objects.filter(author=user)
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_comments(request):
    user = request.user
    comments = Comment.objects.filter(author=user)
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_api_status(request):
    try:
        response = requests.get(f"{FLASK_URL}/status")
        response.raise_for_status()
        return Response(response.json(), status=status.HTTP_200_OK)
    except requests.RequestException as e:
        return Response({'status': 'Error', 'detail': 'FastAPI server is down'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# AWS settings
AWS_REGION = 'ap-northeast-1'
AWS_STORAGE_BUCKET_NAME = 'aivle-8-team-rsb'
AWS_ACCESS_KEY_ID = 'AKIA2TMUP5YA2QQRN5WE'
AWS_SECRET_ACCESS_KEY = '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'
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com'

# Initialize S3 client
s3_client = boto3.client(
    's3',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

@api_view(['POST'])
@permission_classes([AllowAny])
def voice_verity(request):
    api_key = request.headers.get('Authorization')
    if not api_key:
        return Response({'error': 'Missing API key'}, status=401)

    api_key = api_key.replace('Bearer ', '')
    try:
        key = APIKey.objects.get(key=api_key)
        user = key.user
        
        # 크레딧 검증
        today = timezone.now().date()
        
        # 유효한 일일 크레딧 구독
        daily_subscription = UserSubscription.objects.filter(
            user=user, 
            plan__is_recurring=True, 
            is_active=True
        ).first()
        
        # 유효한 추가 크레딧 구독
        additional_subscription = UserSubscription.objects.filter(
            user=user, 
            plan__is_recurring=False, 
            end_date__gt=today, 
            is_active=True
        ).first()

        # free_credits 차감
        if user.free_credits > 0:
            user.free_credits -= 1
            user.save()
        elif daily_subscription and daily_subscription.daily_credits > 0:
            daily_subscription.daily_credits -= 1
            daily_subscription.save()
        elif additional_subscription and additional_subscription.total_credits > 0:
            additional_subscription.total_credits -= 1
            additional_subscription.save()
        else:
            return Response({'error': 'Insufficient credits'}, status=403)

        key.last_used_at = timezone.now()
        key.save()

        # AI 서버 호출
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)

        # Upload the file to S3
        file_key = f'audio_files/{file.name}'
        try:
            s3_client.upload_fileobj(file, AWS_STORAGE_BUCKET_NAME, file_key)
        except Exception as e:
            return Response({'error': 'Failed to upload file to S3', 'details': str(e)}, status=500)

        # Construct the S3 file URL
        file_url = f"https://{AWS_S3_CUSTOM_DOMAIN}/{file_key}"
        print(file_url)

        try:
            response = requests.post(f"{FLASK_URL}/predict", json={'file_path': file_url, 'data_type': 'aws', 'key_verity': True})
            response.raise_for_status()
            ai_result = response.json()
            return Response(ai_result)
        except requests.RequestException as e:
            return Response({'error': 'Failed to connect to AI server', 'details': str(e)}, status=404)
    except APIKey.DoesNotExist:
        return Response({'error': 'Invalid API key'}, status=402)
    except Exception as e:
        return Response({'error': str(e)}, status=500)