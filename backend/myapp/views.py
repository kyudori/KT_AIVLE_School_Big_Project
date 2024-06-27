# views.py (myapp/views.py)

import os
import random
import string
from datetime import timedelta
from django.contrib.auth import get_user_model, authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from .models import AudioFile, UploadHistory, APIKey
from django.db import models 
import requests
from datetime import date
from django.utils import timezone
from dotenv import load_dotenv

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
        contact=data.get('contact', '')
    )
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def login(request):
    data = request.data
    user = authenticate(username=data['email'], password=data['password'])
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
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
def user_info(request):
    user = request.user
    return Response({'email': user.email, 'name': user.username, 'company': user.company, 'contact': user.contact, 'is_staff': user.is_staff})

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

load_dotenv()

FLASK_URL = os.getenv('FLASK_URL')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_audio(request):
    file = request.FILES['file']
    fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'audio_files'))
    filename = fs.save(file.name, file)
    file_url = fs.url(filename)

    # 사용자 API 키 가져오기
    try:
        api_key_obj = APIKey.objects.get(user=request.user)
    except APIKey.DoesNotExist:
        return Response({'error': 'User does not have an API key'}, status=status.HTTP_400_BAD_REQUEST)

    if api_key_obj.credits <= 0:
        return Response({'error': 'Insufficient credits'}, status=401)

    api_key_obj.credits -= 1
    api_key_obj.last_used_at = timezone.now()
    api_key_obj.save()

    # Flask 서버에 파일 경로 전송
    try:
        response = requests.post(f"{FLASK_URL}/web-analyze", json={'file_path': os.path.join(settings.MEDIA_ROOT, 'audio_files', filename)}, headers={'Authorization': f'Bearer {api_key_obj.key}'})
        response.raise_for_status()
        result = response.json().get('result', 'Error')
    except requests.RequestException as e:
        print(f"Error contacting Flask server: {e}")
        result = "Error in Flask server response"

    # DB에 저장
    audio_file = AudioFile(
        user=request.user,
        file_name=file.name,
        file_path=file_url,
        analysis_result=result
    )
    audio_file.save()

    # 업로드 기록 업데이트
    today = date.today()
    upload_history, created = UploadHistory.objects.get_or_create(user=request.user, upload_date=today)
    upload_history.upload_count += 1
    upload_history.save()

    return Response({
        'file_name': file.name,
        'file_path': file_url,
        'analysis_result': result
    }, status=201)
    
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