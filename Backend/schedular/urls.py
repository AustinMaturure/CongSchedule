from django.urls import path
from django.urls.conf import include



urlpatterns = [
    path('api/', include('schedular.api.urls')),
]