from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('home/', views.index, name='index'),
    path('team/', views.team, name='team'),
    path('docs/', views.docs, name='docs'),
    path('api/', views.api, name='api'),
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('password_reset/', views.password_reset, name='password_reset'),
]
