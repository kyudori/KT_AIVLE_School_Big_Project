from django.shortcuts import render, redirect
from django.contrib.auth import login as auth_login, authenticate
from django.contrib.auth.forms import UserCreationForm, PasswordResetForm

def index(request):
    return render(request, 'home/index.html')

def team(request):
    return render(request, 'home/team.html')

def docs(request):
    return render(request, 'home/docs.html')

def api(request):
    return render(request, 'home/api.html')

def login(request):
    return render(request, 'home/login.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            auth_login(request, user)
            return redirect('index')
    else:
        form = UserCreationForm()
    return render(request, 'home/signup.html', {'form': form})

def password_reset(request):
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            form.save(request=request)
            return redirect('login')
    else:
        form = PasswordResetForm()
    return render(request, 'home/password_reset.html', {'form': form})
