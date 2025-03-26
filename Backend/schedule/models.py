from django.db import models

# Create your models here.

class ScheduleSource(models.Model):
    file = models.FileField(upload_to="pdfs")
    uploaded_at = models.DateTimeField(auto_now_add=True)

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

