# views.py (myapp/views.py)

import os
import re
import random
import string
import json
import uuid
import logging
import requests
import boto3
import pytz

from datetime import date, timedelta
from urllib.parse import urlencode

from django.contrib.auth import get_user_model, authenticate, login as django_login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.conf import settings
from django.core.files.storage import FileSystemStorage, default_storage
from django.db import models
from django.db.models import Count, Avg, Sum, F, Q
from django.db.models.functions import TruncHour, TruncDay, TruncWeek, TruncMonth
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from dotenv import load_dotenv

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination

from .models import (
    AudioFile, UploadHistory, APIKey, SubscriptionPlan, UserSubscription, PaymentHistory,
    Payment, Post, Comment, ApiCallHistory, YouTubeAnalysis, CustomUser
)
from .serializers import PostSerializer, CommentSerializer, YouTubeAnalysisSerializer

AI_SERVER_URL = 'http://220.149.235.232:8000'

ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.m4a']
MAX_FILE_SIZE_MB = 10
MAX_UPLOADS_PER_DAY = 5
MAX_YOUTUBE_PER_DAY = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

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

User = get_user_model()

# 회원가입
@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def signup(request):
    data = request.data
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
        sms_marketing = data.get('sms_marketing',False),
        email_marketing = data.get('email_marketing',False),
    )
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)

#회원 탈퇴 전 확인
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_delete_account(request):
    user = request.user
    password = request.data.get('password')
    
    if not user.check_password(password):
        return Response({'error': '비밀번호가 일치하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({'status': '비밀번호가 확인되었습니다.'}, status=status.HTTP_200_OK)

#회원 탈퇴
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()
    return Response({'status': 'Account deleted successfully'}, status=status.HTTP_200_OK)

#로그인
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

#비밀번호 초기화
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

#ID찾기
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

#회원 정보 조회
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
            'id': user.id,
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

#비밀번호 변경
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

#구독 플랜 조회
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

#현재 내 구독 플랜 조회
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

#카카오페이 결제
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    data = request.data
    plan = get_object_or_404(SubscriptionPlan, pk=data['plan_id'])

    # 현재 유저의 활성 구독 확인
    current_subscription = UserSubscription.objects.filter(user=request.user, is_active=True).first()

    # 정기 결제 플랜인 경우, 상위 플랜을 구독 중일 때 하위 플랜 결제 방지
    if plan.is_recurring:
        if current_subscription and current_subscription.plan.is_recurring and current_subscription.plan.price > plan.price:
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

        # Rredirect URLs
        return Response({
            'next_redirect_app_url': response_data.get('next_redirect_app_url'),
            'next_redirect_mobile_url': response_data.get('next_redirect_mobile_url'),
            'next_redirect_pc_url': response_data.get('next_redirect_pc_url')
        })
    except requests.RequestException as e:
        return Response({'error': 'Failed to initiate payment', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#카카오페이 승인 및 저장
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
            # 정기 결제 플랜인 경우 기존 정기 구독 처리
            current_subscription = UserSubscription.objects.filter(user=user, is_active=True, plan__is_recurring=True).first()
            if current_subscription:
                current_subscription.is_active = False
                current_subscription.end_date = timezone.now()
                current_subscription.save()

            # 새로운 정기 구독 생성
            UserSubscription.objects.create(
                user=user,
                plan=payment.plan,
                daily_credits=payment.plan.api_calls_per_day,
                total_credits=payment.plan.credits,
                start_date=timezone.now(),
                end_date=timezone.now() + timedelta(days=30)
            )
        else:
            # 단건 결제 플랜인 경우
            UserSubscription.objects.create(
                user=user,
                plan=payment.plan,
                daily_credits=0,
                total_credits=payment.plan.credits,
                start_date=timezone.now(),
                end_date=timezone.now() + timedelta(days=90),
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

#결제 취소
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cancel_payment(request):
    return redirect(f'{settings.FRONTEND_URL}/plancancel')

#결제 실패
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fail_payment(request):
    return redirect(f'{settings.FRONTEND_URL}/planfail')

load_dotenv()

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
        return Response({'error': 'You have reached the maximum number of uploads for today'}, status=status.HTTP_403_FORBIDDEN)

    # UUID 생성 및 파일 경로 설정
    unique_id = uuid.uuid4()
    file_name = os.path.splitext(file.name)[0]
    file_path = f'audio_files/{file_name}_{unique_id}{file_extension}'

    # S3에 파일 업로드
    saved_file_path = default_storage.save(file_path, file)
    file_url = default_storage.url(saved_file_path)

    # AI 서버에 파일 경로 전송
    try:
        response = requests.post(f"{AI_SERVER_URL}/predict", json={'file_path': file_url, 'data_type': 'aws', 'key_verity': True})
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
        'file_path': default_storage.url(f'audio_files/{file.name}'),
        'analysis_result': result,
        'predictions': predictions,
        'real_cnt': real_cnt,
        'fake_cnt': fake_cnt
    }, status=status.HTTP_201_CREATED)

# YouTube URL 패턴
YOUTUBE_URL_PATTERN  = re.compile(
    r'^(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})')    

# YouTube URL 분석
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_youtube(request):
    url = request.data.get('url')
    if not url:
        return Response({'error': 'No URL provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not re.match(YOUTUBE_URL_PATTERN, url):
        return Response({'error': 'Invalid YouTube URL'}, status=status.HTTP_400_BAD_REQUEST)
    
    today = timezone.now().date()
    upload_history, created = UploadHistory.objects.get_or_create(user=request.user, upload_date=today)

    if upload_history.youtube_upload_count >= MAX_UPLOADS_PER_DAY:
        return Response({'error': 'You have reached the maximum number of uploads for today'}, status=status.HTTP_403_FORBIDDEN)

    try:
        response = requests.post(f"{AI_SERVER_URL}/predict", json={'file_path': url, 'data_type': 'youtube', 'key_verity': True})
        response.raise_for_status()
        result = response.json().get('analysis_result', '')
        predictions = response.json().get('predictions', [])
        fake_cnt = response.json().get('fake_cnt', '')
        real_cnt = response.json().get('real_cnt', '')
    except requests.RequestException as e:
        return Response({'error': 'Error communicating with AI server', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 분석 저장
    YouTubeAnalysis.objects.create(
        user=request.user,
        url=url,
        analysis_result=result
    )

    # 관리자인 경우 카운트 안함, 일반 유저인 경우 카운트
    if not request.user.is_superuser:
        upload_history.youtube_upload_count += 1
        upload_history.save()

    return Response({
        'url': url,
        'analysis_result': result,
        'predictions': predictions,
        'real_cnt': real_cnt,
        'fake_cnt': fake_cnt
    }, status=status.HTTP_201_CREATED)

#API Key 조회 및 관련 정보 조회
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_api_key(request):
    user = request.user

    if request.method == 'GET':
        try:
            api_key = APIKey.objects.get(user=user)
            # last_used_at을 한국 시간으로 변환
            if api_key.last_used_at:
                kst = pytz.timezone('Asia/Seoul')
                last_used_at = api_key.last_used_at.astimezone(kst).strftime("%Y/%m/%d %H:%M:%S")
            else:
                last_used_at = "사용한 기록이 없습니다."
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

#API Key 생성
def generate_api_key():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

#API Key 변경
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

#API Key 삭제
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_api_key(request):
    data = request.data
    user = request.user

    if not user.check_password(data['password']):
        return Response({'error': 'Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    APIKey.objects.filter(user=user).delete()
    return Response({'status': 'API key deleted successfully'})

#API Key 상태 변경 시 확인
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

#Credit 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_credits(request):
    user = request.user
    subscriptions = UserSubscription.objects.filter(user=user, is_active=True)
    today = timezone.now().date()

    # 기본적으로 제공되는 free_credits (매일 5개 지급)
    daily_free_credits = 5
    remaining_free_credits = user.free_credits
    used_free_credits = daily_free_credits - remaining_free_credits

    # 유효한 일일 크레딧 초기화
    total_daily_credits = 0
    used_daily_credits = 0
    remaining_daily_credits = 0

    # 유효한 추가 크레딧 초기화
    total_additional_credits = 0
    used_additional_credits = 0
    remaining_additional_credits = 0

    # 유효한 구독 처리
    for sub in subscriptions:
        if sub.plan.is_recurring:
            # 일일 크레딧 처리
            total_daily_credits += sub.plan.api_calls_per_day
            remaining_daily_credits += sub.daily_credits
        else:
            # 추가 크레딧 처리
            if sub.end_date and sub.end_date.date() > today:
                total_additional_credits += sub.total_credits
                used_additional_credits += sub.total_credits - sub.total_credits * (sub.end_date.date() - today).days // 90

    remaining_additional_credits = total_additional_credits - used_additional_credits

    # 총 크레딧 및 남은 크레딧 계산
    total_credits = daily_free_credits + total_daily_credits + total_additional_credits
    total_remaining_credits = remaining_free_credits + remaining_daily_credits + remaining_additional_credits

    # 사용한 크레딧 계산
    used_credits = total_credits - total_remaining_credits

    return Response({
        'remaining_free_credits': remaining_free_credits,
        'remaining_daily_credits': remaining_daily_credits,
        'remaining_additional_credits': remaining_additional_credits,
        'total_remaining_credits': total_remaining_credits,
        'total_credits': total_credits,
        'used_credits': used_credits
    })

# 사용자 분석 파일 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_files(request):
    user = request.user
    files = AudioFile.objects.filter(user=user)
    data = [{"file_name": f.file_name, "file_path": f.file_path, "result": f.analysis_result} for f in files]
    return Response(data)

class PostPagination(PageNumberPagination):
    page_size = 10

class PostPagination(PageNumberPagination):
    page_size = 10

# 게시판 글 목록 조회
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def posts_list_create(request):
    if request.method == 'GET':
        query = request.GET.get('query', None)
        paginator = PostPagination()

        if query:
            posts = Post.objects.filter(
                Q(title__icontains=query) | Q(author__username__icontains=query)
            ).order_by('-created_at')
        else:
            posts = Post.objects.all().order_by('-created_at')

        notices = posts.filter(is_notice=True)
        non_notices = posts.filter(is_notice=False)

        result_page = paginator.paginate_queryset(non_notices, request)
        serializer = PostSerializer(result_page, many=True)
        notice_serializer = PostSerializer(notices, many=True)
        
        # 댓글 수 추가
        serialized_notices = notice_serializer.data
        for notice in serialized_notices:
            notice['comments_count'] = Comment.objects.filter(post_id=notice['id']).count()

        serialized_posts = serializer.data
        for post in serialized_posts:
            post['comments_count'] = Comment.objects.filter(post_id=post['id']).count()

        return paginator.get_paginated_response({
            'notices': serialized_notices,
            'posts': serialized_posts,
            'count': non_notices.count()
        })

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        data = request.data
        serializer = PostSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# 게시글 수정 삭제 보기
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        user = request.user if request.user.is_authenticated else None
        if post.is_public or (user and (user == post.author or user.is_staff)):
            post.views += 1
            post.save()
            serializer = PostSerializer(post)
            response_data = serializer.data
            response_data['comments'] = [
                comment for comment in response_data['comments']
                if comment['is_public'] or 
                (user and (user.id == comment['author_id'] or user.id == post.author_id or user.is_staff))
            ]
            return Response(response_data)
        elif user and user == post.author:
            post.views += 1
            post.save()
            serializer = PostSerializer(post)
            response_data = serializer.data
            response_data['comments'] = [
                comment for comment in response_data['comments']
                if comment['is_public'] or (user.id == comment['author_id'] or user.is_staff)
            ]
            return Response(response_data)
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
 
#댓글 생성   
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

#댓글 수정 삭제
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

# 사용자 글 보기    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_posts(request):
    user = request.user
    posts = Post.objects.filter(author=user)
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

# 사용자 댓글 보기
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_comments(request):
    user = request.user
    comments = Comment.objects.filter(author=user)
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

#API 서버 상태 확인
@api_view(['GET'])
@permission_classes([AllowAny])
def check_api_status(request):
    try:
        response = requests.get(f"{AI_SERVER_URL}/status")
        response.raise_for_status()
        return Response(response.json(), status=status.HTTP_200_OK)
    except requests.RequestException as e:
        return Response({'status': 'Error', 'detail': 'FastAPI server is down'}, status=503)

# YouTube API 분석
@api_view(['POST'])
@permission_classes([AllowAny])
def youtube_verity(request):
    api_key = request.headers.get('Authorization')
    if not api_key:
        return Response({'error': 'Missing API key'}, status=401)

    api_key = api_key.replace('Bearer ', '')
    try:
        key = APIKey.objects.get(key=api_key)
        user = key.user

        # AI 서버 호출
        youtube_url = request.data.get('youtube_url')
        if not youtube_url:
            return Response({'error': 'No YouTube URL provided'}, status=402)

        # 유튜브 링크 패턴 확인
        if not re.match(YOUTUBE_URL_PATTERN, youtube_url):
            return Response({'error': 'Invalid YouTube link'}, status=400)

        try:
            start_time = timezone.now()
            response = requests.post(f"{AI_SERVER_URL}/predict", json={'file_path': youtube_url, 'data_type': 'youtube', 'key_verity': True})
            response.raise_for_status()
            ai_result = response.json()
            end_time = timezone.now()
            response_time = (end_time - start_time).total_seconds() * 1000  # milliseconds

            # API 호출 기록 저장 (성공)
            ApiCallHistory.objects.create(user=user, api_key=key, endpoint='youtube_verity', success=True, response_time=response_time, youtube_url=youtube_url)

            # 크레딧 차감
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

            return Response(ai_result)
        except requests.RequestException as e:
            # API 호출 기록 저장 (실패)
            ApiCallHistory.objects.create(user=user, endpoint='youtube_verity', success=False, youtube_url=youtube_url)
            return Response({'error': 'AI server OFF', 'details': str(e)}, status=503)
    except APIKey.DoesNotExist:
        return Response({'error': 'Invalid API key'}, status=401)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# 음성 파일 API 분석
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

        # AI 서버 호출
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)
        files = request.FILES.getlist('file')
        if len(files) > 1:
            return Response({'error': 'Only one file can be uploaded at a time'}, status=410)

        # 파일 크기 및 확장자 검증
        file_size = file.size
        file_extension = os.path.splitext(file.name)[1].lower()

        if file_extension not in ALLOWED_EXTENSIONS:
            return Response({'error': 'Invalid file type'}, status=415)

        if file_size > MAX_FILE_SIZE_BYTES:
            return Response({'error': f'File size exceeds {MAX_FILE_SIZE_MB} MB limit'}, status=413)

        # Upload the file to S3
        unique_id = uuid.uuid4()
        file_name = os.path.splitext(file.name)[0]
        file_key = f'audio_files/{file_name}_{unique_id}{file_extension}'

        try:
            s3_client.upload_fileobj(file, AWS_STORAGE_BUCKET_NAME, file_key)
        except Exception as e:
            return Response({'error': 'Failed to upload file to S3', 'details': str(e)}, status=500)

        # Construct the S3 file URL
        file_url = f"https://{AWS_S3_CUSTOM_DOMAIN}/{file_key}"
        print(file_url)

        try:
            start_time = timezone.now()
            response = requests.post(f"{AI_SERVER_URL}/predict", json={'file_path': file_url, 'data_type': 'aws', 'key_verity': True})
            response.raise_for_status()
            ai_result = response.json()
            end_time = timezone.now()
            response_time = (end_time - start_time).total_seconds() * 1000  # milliseconds

            # API 호출 기록 저장 (성공)
            ApiCallHistory.objects.create(user=user, api_key=key, endpoint='voice_verity', success=True, response_time=response_time, file_path=file_url)

            # 크레딧 차감
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

            return Response(ai_result)
        except requests.RequestException as e:
            # API 호출 기록 저장 (실패)
            ApiCallHistory.objects.create(user=user, endpoint='voice_verity', success=False, file_path=file_url)
            return Response({'error': 'AI server OFF', 'details': str(e)}, status=503)
    except APIKey.DoesNotExist:
        return Response({'error': 'Invalid API key'}, status=401)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
 
 # API 호출 분석   
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def call_history(request):
    user = request.user
    interval = request.query_params.get('interval', 'hourly')

    now = timezone.now()

    if interval == 'hourly':
        start_time = now - timedelta(hours=24)
        history = ApiCallHistory.objects.filter(user=user, timestamp__gte=start_time) \
            .annotate(label=TruncHour('timestamp')) \
            .values('label') \
            .annotate(count=Count('id')) \
            .order_by('label')
        
        # Format the label to "10시"
        formatted_history = [{'label': item['label'].astimezone(pytz.timezone('Asia/Seoul')).strftime('%H시'), 'count': item['count']} for item in history]

    elif interval == 'daily':
        start_date = now - timedelta(days=7)
        history = ApiCallHistory.objects.filter(user=user, timestamp__gte=start_date) \
            .annotate(label=TruncDay('timestamp')) \
            .values('label') \
            .annotate(count=Count('id')) \
            .order_by('label')
        
        # Format the label to "7월16일"
        formatted_history = [{'label': item['label'].astimezone(pytz.timezone('Asia/Seoul')).strftime('%m월%d일'), 'count': item['count']} for item in history]

    elif interval == 'weekly':
        start_date = now - timedelta(weeks=26)
        history = ApiCallHistory.objects.filter(user=user, timestamp__gte=start_date) \
            .annotate(label=TruncWeek('timestamp')) \
            .values('label') \
            .annotate(count=Count('id')) \
            .order_by('label')
        
        # Format the label to "7월 1주차", "7월 2주차"
        formatted_history = []
        for item in history:
            label_date = item['label'].astimezone(pytz.timezone('Asia/Seoul'))
            month = label_date.strftime('%m월')
            week_number = (label_date.day - 1) // 7 + 1
            formatted_label = f"{month} {week_number}주차"
            formatted_history.append({'label': formatted_label, 'count': item['count']})

    elif interval == 'monthly':
        start_date = now - timedelta(days=365)
        history = ApiCallHistory.objects.filter(user=user, timestamp__gte=start_date) \
            .annotate(label=TruncMonth('timestamp')) \
            .values('label') \
            .annotate(count=Count('id')) \
            .order_by('label')
        
        # Format the label to "24년 7월"
        formatted_history = [{'label': item['label'].astimezone(pytz.timezone('Asia/Seoul')).strftime('%y년 %m월'), 'count': item['count']} for item in history]

    else:
        return Response({'error': 'Invalid interval'}, status=status.HTTP_400_BAD_REQUEST)

    return Response(formatted_history, status=status.HTTP_200_OK)

# API 호출 요약
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def call_summary(request):
    user = request.user
    interval = request.query_params.get('interval', 'hourly')

    if interval == 'hourly':
        history = ApiCallHistory.objects.filter(user=user).annotate(label=TruncHour('timestamp')).values('label').annotate(count=Count('id')).order_by('label')
    elif interval == 'daily':
        history = ApiCallHistory.objects.filter(user=user).annotate(label=TruncDay('timestamp')).values('label').annotate(count=Count('id')).order_by('label')
    elif interval == 'weekly':
        history = ApiCallHistory.objects.filter(user=user).annotate(label=TruncWeek('timestamp')).values('label').annotate(count=Count('id')).order_by('label')
    elif interval == 'monthly':
        history = ApiCallHistory.objects.filter(user=user).annotate(label=TruncMonth('timestamp')).values('label').annotate(count=Count('id')).order_by('label')
    else:
        return Response({'error': 'Invalid interval'}, status=status.HTTP_400_BAD_REQUEST)

    total_calls = history.aggregate(total=Count('id'))['total']
    avg_response_time = history.aggregate(avg_response=Avg('response_time'))['avg_response']

    # avg_response_time이 None인 경우를 처리
    avg_response_time = round(avg_response_time, 2) if avg_response_time is not None else 0

    max_calls = history.order_by('-count').first()
    min_calls = history.order_by('count').first()

    summary = {
        'total_calls': total_calls,
        'avg_response_time': avg_response_time,
        'max_calls_time': max_calls['label'].astimezone(pytz.timezone('Asia/Seoul')).strftime('%Y년 %m월 %d일 %H시') if max_calls else None,
        'min_calls_time': min_calls['label'].astimezone(pytz.timezone('Asia/Seoul')).strftime('%Y년 %m월 %d일 %H시') if min_calls else None,
        'success_rate': calculate_success_rate(user)
    }

    return Response(summary, status=status.HTTP_200_OK)

# 성공률 보기
def calculate_success_rate(user):
    total_calls = ApiCallHistory.objects.filter(user=user).count()
    success_calls = ApiCallHistory.objects.filter(user=user, success=True).count()
    return round((success_calls / total_calls) * 100, 2) if total_calls > 0 else 0
