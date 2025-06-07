from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.


class Device(models.Model):
    username = models.CharField(max_length=150, null=True, blank=True)
    fcm_token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username or 'Anonymous'} - {self.fcm_token[:10]}..."

class ScheduleSource(models.Model):
    file = models.FileField(upload_to="pdfs")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    modified = models.BooleanField(default=False)

    def __str__(self):
        return self.file.name

class Schedule(models.Model):
    date = models.CharField(max_length=255, null=True)
    summary = models.TextField(null=True)
    def __str__(self):
        return f"Schedule for {self.date}"


class Apply(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, null=True)
    def __str__(self):
        return f"Apply Yourself to the Ministry for week of - {self.schedule.date}"

class ApplyPart(models.Model):
     apply_week = models.ForeignKey(Apply, on_delete=models.CASCADE)
     apply_part = models.CharField(max_length=255)
     def __str__(self):
        return f"{self.apply_part} for week of {self.apply_week.schedule.date}"

class ApplyInfo(models.Model):
    part = models.ForeignKey(ApplyPart, on_delete=models.CASCADE)
    student = models.CharField(max_length=255)
    duration = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.student} - {self.duration}"




class Opening(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, null=True)
    opening_song = models.CharField(max_length=255, null=True)
    opening_prayer = models.CharField(max_length=255, null=True)
    chairman = models.CharField(max_length=255, null=True)
    def __str__(self):
        return f"Opening for week of {self.schedule.date}"


class Treasures(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, null=True)
    bible_reading = models.CharField(max_length=255, null=True)

    def __str__(self):
        return f"Treasures for week of {self.schedule.date}"


class TreasuresTalk(models.Model):
    treasure_week= models.ForeignKey(Treasures, on_delete=models.CASCADE, default="Talk")
    title =   models.CharField(max_length=255, null=True)

    def __str__(self):
        return f"{self.title} for {self.treasure_week.schedule.date}"


class TreasuresTalkInfo(models.Model):
    talk=models.ForeignKey(TreasuresTalk, on_delete=models.CASCADE)
    speaker = models.CharField(max_length=255, null=True)


    def __str__(self):
        return f"{self.talk.title}: {self.speaker}"

class Living(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, null=True)
    living_song = models.CharField(max_length=255, null=True)
    def __str__(self):
        return f"Living as Christians section for {self.schedule.date}"

class BibleStudy(models.Model):
    section = models.ForeignKey(Living, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    def __str__(self):
        return self.title

class BibleStudyInfo(models.Model):
    living_section = models.ForeignKey(BibleStudy, on_delete=models.CASCADE)
    conductor = models.CharField(max_length=255, null=True)
    reader = models.CharField(max_length=255, null=True)

    def __str__(self):
        return f"{self.conductor} - {self.reader}"

class LivingTalk(models.Model):
    section = models.ForeignKey(Living, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    def __str__(self):
        return self.title

class LivingTalkInfo(models.Model):
    living_section = models.ForeignKey(LivingTalk, on_delete=models.CASCADE)
    speaker = models.CharField(max_length=255, null=True)
    duration = models.CharField(max_length=255, null=True)

    def __str__(self):
        return f"{self.speaker} - {self.duration}"

class Closing(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, null=True)
    closing_song = models.CharField(max_length=255, null=True)
    closing_prayer = models.CharField(max_length=255, null=True)
    def __str__(self):
        return f"Closing for week of {self.schedule.date}"

class Duty(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class AssignedDuties(models.Model):
    full_name = models.CharField(max_length=255)
    class Gender(models.TextChoices):
        BROTHER = 'Brother', 'Brother'
        SISTER = 'Sister', 'Sister'
        APPBROTHER = 'Appointed Brother', 'Appointed Brother'

    type = models.CharField(
        max_length=100,
        choices=Gender.choices,
        default=Gender.BROTHER
    )

    def __str__(self):
        return self.full_name


class ApponitedBrother(models.Model):
    brother = models.ForeignKey(AssignedDuties, on_delete=models.CASCADE)
    def __str__(self):
        return self.brother.full_name

class PublicTalk(models.Model):
    speaker = models.ForeignKey(ApponitedBrother, on_delete=models.CASCADE)
    theme = models.CharField(max_length=225)
    def __str__(self):
        return f'{self.theme} - {self.speaker.brother.full_name}'

class WatchtowerStudy(models.Model):

    conductor = models.ForeignKey(ApponitedBrother, on_delete=models.CASCADE, null=True)
    reader = models.ForeignKey(AssignedDuties, on_delete=models.CASCADE, related_name='Reader')
    def __str__(self):
        return f'{self.conductor.brother.full_name} - {self.reader.full_name} '

class SundaySchedule(models.Model):
    date = models.CharField(max_length=255, null=True)
    chairman = models.ForeignKey(ApponitedBrother, on_delete=models.CASCADE, null=True)

    public_discourse = models.ForeignKey(PublicTalk, on_delete=models.CASCADE)
    watchtower = models.ForeignKey(WatchtowerStudy, on_delete=models.CASCADE)

    closing_prayer = models.ForeignKey(AssignedDuties, on_delete=models.CASCADE, related_name='closing_prayer', null=True)

    def __str__(self):
        return f"Sunday Schedule for {self.date}"

class DutyAssignment(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, null=True)
    assigned_duty = models.ForeignKey(AssignedDuties, on_delete=models.CASCADE, null=True)
    duty = models.ForeignKey(Duty, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f" {self.duty.name} for {self.schedule.date} : {self.assigned_duty.full_name} "

class SundayDutyAssignment(models.Model):

    schedule = models.ForeignKey(SundaySchedule, on_delete=models.CASCADE, null=True)
    assigned_duty = models.ForeignKey(AssignedDuties, on_delete=models.CASCADE, null=True)
    duty = models.ForeignKey(Duty, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f" {self.duty.name} for {self.schedule.date} : {self.assigned_duty.full_name} "