from . import views
from django.urls import path

urlpatterns = [
    path('makeschedule', views.makeSchedule),
    path('getschedule/<str:date>', views.getSchedule),
]