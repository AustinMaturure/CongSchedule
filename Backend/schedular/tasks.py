import requests
from celery import shared_task
from .models import Schedule, ApplyInfo, TreasuresTalkInfo, LivingTalkInfo, BibleStudyInfo
from django.utils.timezone import now
import datetime

@shared_task
def send_weekly_talk_reminders():
    today = now().date()
    next_tuesday = today + datetime.timedelta((1 - today.weekday()) % 7)  # Next Tuesday
    week_str = now().strftime('%Y-%m-%d')

    schedules = Schedule.objects.filter(date__icontains=week_str)

    for schedule in schedules:
        # --- Apply Yourself parts ---
        apply_parts = ApplyInfo.objects.filter(part__apply_week__schedule=schedule)
        for part in apply_parts:
            username = part.student
            part_title = part.part.apply_part
            send_push(username, schedule.date, part_title)

        # --- Treasures Talk parts ---
        treasure_parts = TreasuresTalkInfo.objects.filter(talk__treasure_week__schedule=schedule)
        for part in treasure_parts:
            username = part.speaker
            part_title = part.talk.title
            send_push(username, schedule.date, part_title)

        # --- Living Talk parts ---
        living_parts = LivingTalkInfo.objects.filter(living_section__section__schedule=schedule)
        for part in living_parts:
            username = part.speaker
            part_title = part.living_section.title
            send_push(username, schedule.date, part_title)

        # --- Bible Study Conductors ---
        bible_parts = BibleStudyInfo.objects.filter(living_section__section__schedule=schedule)
        for part in bible_parts:
            username = part.conductor
            part_title = part.living_section.title + " (Bible Study)"
            send_push(username, schedule.date, part_title)

def send_push(username, date, part_title):
    """Send push notification via Native Notify."""
    requests.post("https://app.nativenotify.com/api/indie/notification", json={
        "subID": username,
        "appId": 30372,
        "appToken": "V5RLQTBtFfP9XFGmASMHuo",
        "title": "Talk Reminder ⏰",
        "message": f"You have the part '{part_title}' this week for the meeting on {date}."
    })
