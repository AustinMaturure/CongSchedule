from django.contrib import admin
from .models import *
from django.db.models import Q

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

admin.site.register(AssignedDuties)
admin.site.register(DutyAssignment)
admin.site.register(Duty)



class BrothersFilterAdmin(admin.ModelAdmin):
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name in ['reader','closing_prayer']:
            kwargs["queryset"] = AssignedDuties.objects.filter(Q(type="Brother") | Q(type="Appointed Brother"))
        
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
class AppointedBrothersFilterAdmin(admin.ModelAdmin):
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name in ['conductor','speaker', 'chairman']:
            kwargs["queryset"] = AssignedDuties.objects.filter(type="Appointed Brother")

        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

admin.site.register(WatchtowerStudy, BrothersFilterAdmin)
admin.site.register(PublicTalk)
admin.site.register(ApponitedBrother, AppointedBrothersFilterAdmin)
admin.site.register(SundaySchedule, BrothersFilterAdmin)
