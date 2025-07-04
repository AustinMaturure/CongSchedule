from . import views
from django.urls import path

urlpatterns = [
    path('makeschedule', views.makeSchedule),
 path('makeschedul', views.parse_new_schedule),
    path('getschedule/<str:date>', views.getSchedule),
    path('getsundayschedule/<str:date>', views.getSundaySchedule),
    path('getuserschedule/<str:firstname>/<str:lastname>', views.getUserSchedule),
    path('getsunduties/<str:username>', views.getSun),
    path('getmodified/', views.getModified),
    path('notification/', views.send_weekly_talk_reminders),
    path('dutyreminders/', views.send_weekly_duties_reminders),
    path('adddevice/', views.add_device),
    path('sendall/', views.sendAll),

]
