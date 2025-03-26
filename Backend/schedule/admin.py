from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(ScheduleSource)

admin.site.register(Schedule)
admin.site.register(Opening)
admin.site.register(Treasures)
admin.site.register(TreasuresTalk)
admin.site.register(TreasuresTalkInfo)
admin.site.register(Apply)
admin.site.register(ApplyPart)
admin.site.register(ApplyInfo)

admin.site.register(Living)
admin.site.register(LivingTalk)
admin.site.register(LivingTalkInfo)
admin.site.register(Closing)
