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
from .models import AudioFile, UploadHistory, APIKey, SubscriptionPlan, UserSubscription, PaymentHistory, Payment
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

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    if request.method == 'GET':
        profile_image_url = user.profile_image.url if user.profile_image else None
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
            # 파일을 S3에 저장
            profile_image = request.FILES['profile_image']
            file_name = f"profile_images/{user.username}/{profile_image.name}"
            file_path = default_storage.save(file_name, profile_image)
            file_url = default_storage.url(file_path)
            
            user.profile_image = file_path

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

# 카카오페이

@api_view(['GET'])
@permission_classes([AllowAny])
def subscription_plans(request):
    plans = SubscriptionPlan.objects.all()
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


# 설정된 로거 사용
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    data = request.data
    plan = get_object_or_404(SubscriptionPlan, pk=data['plan_id'])

    kakao_api_url = 'https://open-api.kakaopay.com/online/v1/payment/ready'
    headers = {
        'Authorization': f'SECRET_KEY {settings.KAKAO_DEV_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    payload = {
        'cid': 'TC0ONETIME',  # 테스트용 가맹점 코드
        'partner_order_id': request.user.email,
        'partner_user_id': request.user.username,
        'item_name': plan.name,
        'quantity': 1,
        'total_amount': int(plan.price),
        'tax_free_amount': 0,
        'approval_url': settings.APPROVAL_URL,
        'cancel_url': settings.CANCEL_URL,
        'fail_url': settings.FAIL_URL,
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
            amount=plan.price,
            status='initiated'
        )

        # 세션에 tid 저장
        request.session['tid'] = response_data['tid']
        request.session.modified = True  # 세션이 변경되었음을 명시적으로 표시
        print("Session TID:", request.session['tid'])  # 디버깅 로그

        return Response({'next_redirect_pc_url': response_data['next_redirect_pc_url']})
    except requests.RequestException as e:
        return Response({'error': 'Failed to initiate payment', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approve_payment(request):
    user = request.user

    # 세션에서 tid 가져오기
    tid = request.session.get('tid')
    print("Retrieved TID from session:", tid)  # 디버깅 로그
    if not tid:
        return Response({'error': 'Transaction ID not found in session'}, status=status.HTTP_400_BAD_REQUEST)

    kakao_api_url = 'https://open-api.kakaopay.com/online/v1/payment/approve'
    headers = {
        'Authorization': f'SECRET_KEY {settings.KAKAO_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    params = {
        'cid': 'TC0ONETIME',
        'tid': tid,
        'partner_order_id': user.email,
        'partner_user_id': user.username,
        'pg_token': request.GET.get('pg_token'),
    }

    try:
        response = requests.post(kakao_api_url, headers=headers, data=json.dumps(params))
        response_data = response.json()

        if 'aid' not in response_data:
            return Response({'error': 'Failed to approve payment', 'details': response_data}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 결제 승인 후 결제 정보 업데이트
        payment = Payment.objects.get(tid=tid)
        payment.status = 'approved'
        payment.save()

        UserSubscription.objects.create(user=user, plan=payment.plan, daily_credits=payment.plan.api_calls_per_day, total_credits=payment.plan.credits)
        PaymentHistory.objects.create(user=user, plan=payment.plan, amount=payment.amount)

        return Response({'status': 'Payment approved successfully'})
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
MAX_FILE_SIZE_MB = 500
MAX_UPLOADS_PER_DAY = 6060

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

    # Flask 서버에 파일 경로 전송
    try:
        response = requests.post(f"{FLASK_URL}/predict", json={'file_path': file_url})
        response.raise_for_status()
        result = response.json().get('analysis_result', '')
        predictions = response.json().get('predictions', [])
        fake_cnt = response.json().get('fake_cnt', '')
        real_cnt = response.json().get('real_cnt', '')
    except requests.RequestException as e:
        result = "AI 서버 OFF, Test 데이터"
        predictions = [0.1, 0.1, 0.1, 0.1, 0.9, 0.9]
        fake_cnt = 2
        real_cnt = 4
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

    # 업로드 기록 업데이트
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_api_key(request):
    data = request.data
    user = request.user

    if not user.check_password(data['password']):
        return Response({'error': 'Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    if not APIKey.objects.filter(user=user).exists():
        api_key = APIKey.objects.create(user=user, key=generate_api_key())
    else:
        api_key = APIKey.objects.get(user=user)

    return Response({'api_key': api_key.key})

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_credits(request):
    user = request.user
    try:
        api_key = APIKey.objects.get(user=user)
        return Response({'credits': api_key.credits})
    except APIKey.DoesNotExist:
        return Response({'credits': 0})
    
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def validate_key(request):
    api_key = request.headers.get('Authorization')
    if not api_key:
        return Response({'valid': False, 'error': 'Missing API key'}, status=401)

    api_key = api_key.replace('Bearer ', '')
    try:
        key = APIKey.objects.get(key=api_key)
        if key.credits <= 0:
            return Response({'valid': False, 'error': 'Insufficient credits'}, status=401)

        key.credits -= 1
        key.last_used_at = timezone.now()
        key.save()
        return Response({'valid': True})
    except APIKey.DoesNotExist:
        return Response({'valid': False, 'error': 'Invalid API key'}, status=401)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_usage_weekly(request):
    user = request.user
    one_week_ago = timezone.now() - timedelta(days=7)
    history = UploadHistory.objects.filter(user=user, upload_date__gte=one_week_ago)
    data = [{"date": h.upload_date, "count": h.upload_count} for h in history]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_usage(request):
    group_data = (
        UploadHistory.objects
        .values('user__company')
        .annotate(total_uploads=models.Sum('upload_count'))
    )
    return Response(group_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_files(request):
    user = request.user
    files = AudioFile.objects.filter(user=user)
    data = [{"file_name": f.file_name, "file_path": f.file_path, "result": f.analysis_result} for f in files]
    return Response(data)
