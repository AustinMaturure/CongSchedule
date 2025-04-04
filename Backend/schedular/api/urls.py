from . import views
from django.urls import path

urlpatterns = [
    path('makeschedule', views.makeSchedule),\

    path('getschedule/<str:date>', views.getSchedule),
    path('getsundayschedule/<str:date>', views.getSundaySchedule),
    path('getuserschedule/<str:firstname>/<str:lastname>', views.getUserSchedule),
    path('getsunduties/<str:username>', views.getSun)
]