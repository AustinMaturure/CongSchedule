from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import re
from pdfminer.high_level import extract_text, extract_pages
from schedule.models import *
from .serializers import *
from rest_framework.exceptions import NotFound
from datetime import datetime, timedelta
import requests
from google.oauth2 import service_account
import google.auth.transport.requests
from django.utils.timezone import now
from collections import defaultdict
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.db.models import Q
import os

@api_view(['GET'])
@permission_classes([AllowAny]) 
def parse_new_schedule(request):
    file_path = '/Users/austinematurure/Documents/CongSchedule/Backend/pdfs/Piet Retief  May 2025 Life and Ministry Meeting Schedule-.pdf'
    text = extract_text(file_path)
    print(text)
    text = text.replace("\u2640", "")
    text = text.replace("Printed", "")
    schedule_entries = []

    day_blocks = re.split(r'(?=\d{2} \w+ 2025)', text)

    for block in day_blocks:
        if not block.strip():
            continue

        date_match = re.match(r'(\d{2} \w+ 2025)', block)
        date_str = date_match.group(1) if date_match else None
        try:
            date = datetime.strptime(date_str, "%d %B %Y").date() if date_str else None
        except ValueError:
            date = None

        events = re.findall(r'(\d{2}:\d{2})(.*?)((?=\d{2}:\d{2})|(?=Review / Preview)|$)', block, re.DOTALL)

        for time, content, _ in events:
            content = content.strip()

            song_match = re.match(r'Song (\d+)\s*-\s*(.+)', content)
            if song_match:
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Song",
                    "number": song_match.group(1),
                    "title": song_match.group(2).strip()
                })
                continue

            if content.startswith("Opening Prayer"):
                name = content.replace("Opening Prayer", "").strip()
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Opening Prayer",
                    "name": name
                })
                continue

            if content.startswith("Closing Prayer"):
                name = content.replace("Closing Prayer", "").strip()
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Closing Prayer",
                    "name": name
                })
                continue

            if "Chairman" in content:
                parts = content.split("Chairman")
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Chairman",
                    "name": parts[-1].strip()
                })
                continue

            talk_match = re.match(r'\d+\.\s*(.*?)\s*\((\d+) min\.\)(.*)', content)
            if talk_match:
                title, duration, name = talk_match.groups()
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Talk",
                    "title": title.strip(),
                    "duration": int(duration),
                    "name": name.strip()
                })
                continue

            if "Bible Reading" in content:
                reader = content.replace("Bible Reading", "").strip()
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Bible Reading",
                    "name": reader
                })
                continue

            if any(keyword in content for keyword in ["Starting a Conversation", "Following Up", "Making Disciples", "Talk"]):
                task_match = re.match(r'(.*?)\((\d+) min\.\)(.*)', content)
                if task_match:
                    task, duration, names = task_match.groups()
                    schedule_entries.append({
                        "date": str(date),
                        "time": time,
                        "type": task.strip(),
                        "duration": int(duration),
                        "name": names.strip()
                    })
                continue

            if "Congregation Bible Study" in content:
                study_match = re.search(r'Conductor\s+(.*?)\s+Reader\s+(.*)', content)
                if study_match:
                    conductor, reader = study_match.groups()
                    schedule_entries.append({
                        "date": str(date),
                        "time": time,
                        "type": "Congregation Bible Study",
                        "conductor": conductor.strip(),
                        "reader": reader.strip()
                    })
                continue

       
            schedule_entries.append({
                "date": str(date),
                "time": time,
                "type": "Other",
                "content": content
            })
    print(schedule_entries)
    return Response({"done": schedule_entries}, status=404)



@api_view(['GET'])
@permission_classes([AllowAny])
def makeSchedule(request):
    file_path = '/Users/austinematurure/Documents/CongSchedule/Backend/pdfs/Piet Retief  May 2025 Life and Ministry Meeting Schedule-.pdf'
    text = extract_text(file_path)
    print(text)
    text = text.replace("\u2640", "")
    text = text.replace("Printed", "")
    
    schedule_entries = []
    day_blocks = re.split(r'(?=\d{2} \w+ 2025)', text)
    
    for block in day_blocks:
        if not block.strip():
            continue

        date_match = re.match(r'(\d{2} \w+ 2025)', block)
        date_str = date_match.group(1) if date_match else None
        try:
            date = datetime.strptime(date_str, "%d %B %Y").date() if date_str else None
        except ValueError:
            date = None

        events = re.findall(r'(\d{2}:\d{2})(.*?)((?=\d{2}:\d{2})|(?=Review / Preview)|$)', block, re.DOTALL)

        for time, content, _ in events:
            content = content.strip()

            song_match = re.match(r'Song (\d+)\s*-\s*(.+)', content)
            if song_match:
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Song",
                    "number": song_match.group(1),
                    "title": song_match.group(2).strip()
                })
                continue

            if content.startswith("Opening Prayer"):
                name = content.replace("Opening Prayer", "").strip()
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Opening Prayer",
                    "name": name
                })
                continue

            if content.startswith("Closing Prayer"):
                name = content.replace("Closing Prayer", "").strip()
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Closing Prayer",
                    "name": name
                })
                continue

            if "Chairman" in content:
                parts = content.split("Chairman")
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Chairman",
                    "name": parts[-1].strip()
                })
                continue

            talk_match = re.match(r'\d+\.\s*(.*?)\s*\((\d+) min\.\)(.*)', content)
            if talk_match:
                title, duration, name = talk_match.groups()
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Talk",
                    "title": title.strip(),
                    "duration": int(duration),
                    "name": name.strip()
                })
                continue

            if "Bible Reading" in content:
                reader = content.replace("Bible Reading", "").strip()
                schedule_entries.append({
                    "date": str(date),
                    "time": time,
                    "type": "Bible Reading",
                    "name": reader
                })
                continue

            if any(keyword in content for keyword in ["Starting a Conversation", "Following Up", "Making Disciples", "Talk"]):
                task_match = re.match(r'(.*?)\((\d+) min\.\)(.*)', content)
                if task_match:
                    task, duration, names = task_match.groups()
                    schedule_entries.append({
                        "date": str(date),
                        "time": time,
                        "type": task.strip(),
                        "duration": int(duration),
                        "name": names.strip()
                    })
                continue

            if "Congregation Bible Study" in content:
                study_match = re.search(r'Conductor\s+(.*?)\s+Reader\s+(.*)', content)
                if study_match:
                    conductor, reader = study_match.groups()
                    schedule_entries.append({
                        "date": str(date),
                        "time": time,
                        "type": "Congregation Bible Study",
                        "conductor": conductor.strip(),
                        "reader": reader.strip()
                    })
                continue

 
            schedule_entries.append({
                "date": str(date),
                "time": time,
                "type": "Other",
                "content": content
            })
    

    schedule = {}
    for entry in schedule_entries:
        date = entry["date"]
        time = entry["time"]
        type_ = entry["type"]


        sch, created = Schedule.objects.get_or_create(date=date)
        if type_ == "Song":
            opening = Opening.objects.create(schedule=sch, opening_song=entry.get("title"))
            day_schedule = {"Date": date, "Opening": {"Opening Song": entry.get("title")}}

        elif type_ == "Opening Prayer":
            opening_prayer = entry.get("name")
            opening = Opening.objects.create(schedule=sch, opening_prayer=opening_prayer)
            day_schedule["Opening"]["Opening Prayer"] = opening_prayer
        
        elif type_ == "Closing Prayer":
            closing_prayer = entry.get("name")
            closing = Closing.objects.create(schedule=sch, closing_prayer=closing_prayer)
            day_schedule["Closing"]["Closing Prayer"] = closing_prayer

        elif type_ == "Chairman":
            chairman = entry.get("name")
            opening = Opening.objects.create(schedule=sch, chairman=chairman)
            day_schedule["Opening"]["Chairman"] = chairman
        
        elif type_ == "Talk":
            talk_title = entry.get("title")
            talk_speaker = entry.get("name")
            talk_duration = entry.get("duration")
            treasures = Treasures.objects.create(schedule=sch)
            talk = TreasuresTalk.objects.create(treasure_week=treasures, title=talk_title)
            talk_info = TreasuresTalkInfo.objects.create(talk=talk, speaker=talk_speaker)
            day_schedule["Treasures"] = {"Talk": {"Title": talk_title, "Speaker": talk_speaker}}

        elif type_ == "Bible Reading":
            bible_reader = entry.get("name")
            treasures = Treasures.objects.create(schedule=sch, bible_reading=bible_reader)
            day_schedule["Treasures"]["Bible Reading"] = bible_reader

        elif type_ == "Congregation Bible Study":
            conductor = entry.get("conductor")
            reader = entry.get("reader")
            living = Living.objects.create(schedule=sch)
            bible_study = BibleStudy.objects.create(section=living, conductor=conductor, reader=reader)
            day_schedule["Living as Christians"] = {"Congregation Bible Study": {"Conductor": conductor, "Reader": reader}}

        else:
            print(f"Unknown type: {type_}")

        schedule[date] = day_schedule

    return Response(schedule, status=200)



@api_view(["GET"])
@permission_classes([AllowAny]) 
def getSchedule(request, date):
    try:
        datetime_obj =datetime.strptime(date, '%d %B %Y')
        print(f"Received date string: {date}") 
        dates = Schedule.objects.all()
        list_dates = ScheduleDateSerializer(dates, many=True)
        
        for index, date in enumerate(list_dates.data):
            current_date = datetime.strptime(date['date'], '%d %B %Y') 
            if index + 1 < len(list_dates.data):  
                next_date = datetime.strptime(list_dates.data[index + 1]['date'], '%d %B %Y') 

             
                if datetime_obj > current_date and datetime_obj < next_date:
                    datetime_obj = next_date
                    break  
            else:
                print("No next date, this is the last date.")

        
        date_string = datetime_obj.strftime('%d %B %Y')
        print(f"Fetching: {date_string}") 
        for index, date in enumerate(list_dates.data):
            current_date = datetime.strptime(date['date'], '%d %B %Y')
            
        try:
            schedule = Schedule.objects.get(date=date_string)
        except:
            return Response({"error": "No matching date found in the schedule."}, status=status.HTTP_404_NOT_FOUND)


        opening = Opening.objects.get(schedule=schedule)

        treasures = Treasures.objects.get(schedule=schedule)


        apply = Apply.objects.get(schedule=schedule)


        living = Living.objects.get(schedule=schedule)


        closing = Closing.objects.get(schedule=schedule)

        duties = DutyAssignment.objects.filter(schedule=schedule)


        data = {
            "Schedule": ScheduleSerializer(schedule).data,
            "Opening": OpeningSerializer(opening).data,
            "Treasures": TreasuresSerializer(treasures).data,
            "Apply Yourself": ApplySerializer(apply).data,
            "Living as Christians": LivingSerializer(living).data,
            "Closing": ClosingSerializer(closing).data,
            "Duties": DutyAssignmentSerializer(duties, many=True).data
        }

        
        
        
        return Response(data)
    except Schedule.DoesNotExist:
        raise NotFound(detail="Schedule for the given week does not exist.")
    
@api_view(["GET"])
@permission_classes([AllowAny])
def getModified(request):
   schedule = ScheduleSource.objects.first()
   
   if schedule and schedule.modified is True:
        return Response({"is_modified": True}, status=status.HTTP_200_OK)
   else:
        return Response({"is_modified": False}, status=status.HTTP_200_OK)
    

    

@api_view(["GET"])
@permission_classes([AllowAny])
def getSundaySchedule(request, date):
    try:

        datetime_obj = datetime.strptime(date, '%d %B %Y')
        print(f"Received date string: {date}")
            

        dates = SundaySchedule.objects.all()
        



        for sunday_schedule in dates:
            current_date = datetime.strptime(sunday_schedule.date, '%d %B %Y').replace(hour=0, minute=0, second=0, microsecond=0)
            
            if current_date >= datetime_obj:
                date_string = current_date.strftime('%d %B %Y')
                print(f"Fetching schedule for: {date_string}")
                
 
                try:
                    schedule = SundaySchedule.objects.get(date=date_string)
                    duties = SundayDutyAssignment.objects.filter(schedule=schedule)
                    serializer = SundayScheduleSerializer(schedule)
                    schedule_serializer = SundayScheduleSerializer(schedule)
                    duties_serializer = DutyAssignmentSerializer(duties, many=True)
        
        
                    response_data = schedule_serializer.data
                    response_data['duties'] = duties_serializer.data
                    return Response(response_data)
                except SundaySchedule.DoesNotExist:
                    return Response({"error": "No matching date found in the schedule."}, status=status.HTTP_404_NOT_FOUND)


        return Response({"error": "No upcoming schedule found."}, status=status.HTTP_404_NOT_FOUND)

    except ValueError as e:

        return Response({"error": "Invalid date format. Please use 'dd Month yyyy' format."}, status=status.HTTP_400_BAD_REQUEST)     
        
    except SundaySchedule.DoesNotExist:
        raise NotFound(detail="Schedule for the given week does not exist.")

def getSun(username):
        print(f"Username: {username}")
        
        assigned_duties = AssignedDuties.objects.filter(full_name__icontains=username)
        
        if not assigned_duties.exists():
            return ([])

        result = []

        for duty in assigned_duties:
            print(f"Assigned Duty: {duty.full_name}")
      
            appointed_brother = ApponitedBrother.objects.filter(brother=duty).first()



            public_talks = PublicTalk.objects.filter(speaker=appointed_brother)
            for talk in public_talks:
               
                sunday_schedule = SundaySchedule.objects.filter(public_discourse=talk).first()
                schedule_date = sunday_schedule.date if sunday_schedule else "N/A"

                result.append({
                    "schedule_date": schedule_date,
                    "day":datetime.strptime(schedule_date, "%d %B %Y").strftime("%A"),
                    "title_or_theme": talk.theme,
                    "student": talk.speaker.brother.full_name,
                    "section": "Public Talk",
                })
            print("reasdr"+duty.full_name)
            watchtower_studies = WatchtowerStudy.objects.filter(
    Q(conductor=appointed_brother ) | Q(reader__full_name=duty.full_name) 
    
)
            for study in watchtower_studies:
                
                
                sunday_schedule = SundaySchedule.objects.filter(watchtower=study)
                for sunday_schedule in sunday_schedule:
                    schedule_date = sunday_schedule.date if sunday_schedule else "N/A"

                    result.append({
                        "schedule_date": schedule_date,  
                        "day":datetime.strptime(schedule_date, "%d %B %Y").strftime("%A"),
                        "section":"Weekend Meeting",
                        "title_or_theme": "Watchtower Study",
                        "reader": study.reader.full_name,
                        "conductor": study.conductor.brother.full_name if study.conductor else "N/A",
                    })
 
            sunday_schedules = SundaySchedule.objects.filter(chairman=appointed_brother)
            for schedule in sunday_schedules:
                result.append({
                    "schedule_date": schedule.date,
                    "day":datetime.strptime(schedule.date, "%d %B %Y").strftime("%A"),
                    "section": "Weekend Meeting Assignment", 
                    "title_or_theme": "Chairman",  
                    "duty": schedule.chairman.brother.full_name,
                    "reader": "N/A",
                    "conductor": "N/A"
                })

           
            duties = SundaySchedule.objects.filter(closing_prayer=duty)
            for duty_schedule in duties:
                result.append({
                    "schedule_date": duty_schedule.date,
                    "section": "Weekend Meeting Assignment", 
                    "day":datetime.strptime(duty_schedule.date, "%d %B %Y").strftime("%A"),
                    "duty": duty.full_name,
                    "title_or_theme": "Closing Prayer", 
                    "duration": "N/A", 
                    "student": "N/A", 
                    "reader": "N/A", 
                    "conductor": "N/A",  
                })
           
        print(f"Result: {result}")
        return (result)

@api_view(["GET"])
@permission_classes([AllowAny]) 
def getUserSchedule(request, firstname, lastname):
    first_name = firstname
    last_name = lastname
    username = first_name + last_name
    print(f"Username: {username}")
    
    if not first_name:
        return Response({"error": "First name parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

    username_lower = username.lower()

    try:
        user = get_user_model().objects.get(username__icontains=username)
    except get_user_model().objects.get(username__icontains=username).DoesNotExist:

        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    opening_matches = Opening.objects.filter(
        Q(opening_prayer__icontains=user.first_name)
    ).select_related('schedule')

    apply_info_matches = ApplyInfo.objects.filter(
        Q(student__icontains=user.first_name)
    ).select_related('part__apply_week__schedule')

    bible_reading_matches = Treasures.objects.filter(
            Q(bible_reading__icontains=user.first_name)
        ).select_related('schedule')

    treasure_talk_matches = TreasuresTalkInfo.objects.filter(
        Q(speaker__icontains=user.first_name)
    ).select_related('talk__treasure_week__schedule')

    bible_study_matches = BibleStudyInfo.objects.filter(
        Q(conductor__icontains=user.first_name) | Q(reader__icontains=user.first_name)
    ).select_related('living_section__section')



    living_talk_matches = LivingTalkInfo.objects.filter(
        Q(speaker__icontains=user.first_name)
    ).select_related('living_section__section')
    closing_matches = Closing.objects.filter(
        Q(closing_prayer__icontains=user.first_name)
    ).select_related('schedule')

    midweek_duty_matches = DutyAssignment.objects.filter(
    Q(assigned_duty__full_name__icontains=user.first_name)
).select_related('schedule', 'assigned_duty', 'duty')
    







    sunday_duty_matches = SundayDutyAssignment.objects.filter(
    Q(assigned_duty__full_name__icontains=user.first_name)
).select_related('schedule', 'assigned_duty', 'duty')



    all_matches = list(opening_matches) +  list(apply_info_matches) + list(treasure_talk_matches)+ list(bible_reading_matches)+ list(bible_study_matches) + list(living_talk_matches)+ list(sunday_duty_matches) + list(midweek_duty_matches)


    results = [] + getSun(first_name+' ' +last_name)
    for match in all_matches:
        result = {}


        if isinstance(match, Opening):
            result = {
                'schedule_date': match.schedule.date,
                'day': datetime.strptime(match.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Opening',
                'title_or_theme': f'Opening prayer',
                
            }
        elif isinstance(match, ApplyInfo):
            result = {
                'schedule_date': match.part.apply_week.schedule.date,
                'day': datetime.strptime(match.part.apply_week.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Apply yourself to the Ministry',
                'title_or_theme': f'{match.part.apply_part}',
                'duration': match.duration if match.duration else 'N/A',
                'student': match.student,
            }
        elif isinstance(match, TreasuresTalkInfo):
            result = {
                'schedule_date': match.talk.treasure_week.schedule.date,
                'day': datetime.strptime(match.talk.treasure_week.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Treasures from God\'s Word',
                'title_or_theme': match.talk.title,
                       
            }
        elif isinstance(match, Treasures):
            result = {
                'schedule_date': match.schedule.date,
                'day': datetime.strptime(match.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Treasures from God\'s Word',
                'title_or_theme': f'Bible Reading',
                'reader': match.bible_reading if match.bible_reading else 'N/A',
                
            }
        elif isinstance(match, BibleStudyInfo):
            result = {
                'schedule_date': match.living_section.section.schedule.date,
                'day': datetime.strptime(match.living_section.section.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Living as Christians',
                'title_or_theme': "Congregation Bible Study",
                'conductor':match.conductor,
                'reader': match.reader
                
            }

        elif isinstance(match, LivingTalkInfo):
            result = {
                'schedule_date': match.living_section.section.schedule.date,
                'day': datetime.strptime(match.living_section.section.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Living as Christians',
                'title_or_theme': match.living_section.title,
                'duration': match.duration if match.duration else 'N/A',
            }
        elif isinstance(match, Closing):
            result = {
                'schedule_date': match.schedule.date,
                'day': datetime.strptime(match.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Midweek Closing',
                'title_or_theme': f'Closing prayer',
                
            }

        elif isinstance(match, SundayDutyAssignment):
            result = {
                'schedule_date': match.schedule.date,
                'day':datetime.strptime(match.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Weekend Duty Assignment',
                'title_or_theme': match.duty.name,
                'duty': match.assigned_duty.full_name,
            }
      
  
        elif isinstance(match, DutyAssignment):
            result = {
                'schedule_date': match.schedule.date,
                'day': datetime.strptime(match.schedule.date, "%d %B %Y").strftime("%A"),
                'section': 'Midweek Duty Assignment',
                'title_or_theme': match.duty.name,
                'duty': match.assigned_duty.full_name,
            }
        results.append(result)
   
    def parse_date(date_str):
     return datetime.strptime(date_str, '%d %B %Y')

    current_date = datetime.now() 
    current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    future_results = [result for result in results if parse_date(result['schedule_date']) >= current_date]
    sorted_results = sorted(future_results, key=lambda x: parse_date(x['schedule_date']))
    serializer = ScheduleResultSerializer(sorted_results, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


    
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 

@api_view(["POST"])
@permission_classes([AllowAny])
def add_device(request):
    username = request.data.get("username", None)
    fcm_token = request.data.get("fcm_token")

    if not fcm_token:
        return Response({"error": "FCM token is required"}, status=status.HTTP_400_BAD_REQUEST)

    device, created = Device.objects.update_or_create(
        fcm_token=fcm_token,
        defaults={"username": username}
    )

    serializer = DeviceSerializer(device)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

def send_push(token, date, part_title, title="Talk Reminder 🕓"):
    today = datetime.now().date()
    dt = datetime.strptime(date, "%d %B %Y").date()
    difference = (dt - today).days

    meeting_date = "this week"

    match difference:
        case 0:
            meeting_date = "today"
            title = "Talk Reminder 📢"
        case 1:
            meeting_date = "tomorrow"
        case d if d >= 5:
            meeting_date = "next week"

    url = "https://exp.host/--/api/v2/push/send"
    payload = {
        "to": token,
        "title": title,
        "body": f"{part_title} for the meeting {meeting_date}, {date}.",
        "priority": "high"
    }

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        return {
            "success": True,
            "status": response.status_code,
            "data": data,
            "payload": payload
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": str(e),
            "payload": payload
        }


    
@api_view(["GET"])
@permission_classes([AllowAny])
def sendAll(request):
    devices = Device.objects.all()
    url = "https://exp.host/--/api/v2/push/send"
    headers = {"Content-Type": "application/json"}

    results = []
    title='New Schedule Available'
    text='A new schedule is available. Tap to view'
    
    for device in devices:
        payload = {
            "to": device.fcm_token,
            "title": title,
            "body": text,
            "priority": "high"
        }
        

        try:
            response = requests.post(url, headers=headers, json=payload)
            results.append({"device": device.fcm_token, "response": response.json()})
        except Exception as e:
            results.append({"device": device.fcm_token, "error": str(e)})

    return Response({"results": results})
    

def getThursday():
    today = datetime.now().date()
    days_until_thursday = (3 - today.weekday()) % 7

    if days_until_thursday == 0:
        target_date = today
    else:
        target_date = today + timedelta(days=days_until_thursday)

    return target_date.strftime("%d %B %Y")

@api_view(["GET"])
@permission_classes([AllowAny])
def send_weekly_duties_reminders(request):
    target_date_str = getThursday()
    schedule = Schedule.objects.get(date=target_date_str)
    duties = DutyAssignment.objects.filter(schedule=schedule)
    duties = DutyAssignmentSerializer(duties, many=True)
    notifications = []
    for duty in duties.data:
        for role, person in duty.items():
            parts = person.split(" ")
            name = parts[0]
            surname = " ".join(parts[1:]) if len(parts) > 1 else ""
            emoji = ""
            match role:
                case "Zoom":
                    emoji = "💻"
                case "Sound":
                    emoji = "🔊"
                case "Platform":
                    emoji = "🪜"
                case "Microphones":
                    emoji = "🎤"
                case "Attendant":
                    emoji = "🙋‍♂️"
                case _:
                    emoji = ""

            device = Device.objects.filter(username=person).first()
            if device:
                result = send_push(device.fcm_token, target_date_str, f'Hi {name}, your duty assignment is: {role} {emoji},', 'Duty Assignment Reminder 📋')
                notifications.append({
                    "username": device.username,
                    "date": schedule.date,
                    "part_title": f" Hi {name}, your duty assignment is: {role} {emoji}, for the meeting this week, {schedule.date}",
                    "status": "sent" if result["success"] else "failed",
                    "error": result.get("error"),
                })

    
    return Response({"notifications": notifications})


    


@api_view(["GET"])
@permission_classes([AllowAny])
def send_weekly_talk_reminders(request):
    
    target_date_str = getThursday()
    
    
    schedules = Schedule.objects.filter(date=target_date_str)
    serializer = ScheduleSerializer(schedules, many=True)
    print(schedules)

    notifications = []
    missing_devices = set()
    print(Device.objects.all())
    
    for schedule in schedules:
        # --- Apply Yourself parts ---
        apply_parts = ApplyInfo.objects.filter(part__apply_week__schedule=schedule)
        for part in apply_parts:
            full_names = [name.strip() for name in part.student.split(" & ") if name.strip()]
            part_title = part.part.apply_part
            duration = part.duration
            if not full_names:
                continue  

            if len(full_names) == 1:
                username = full_names[0]
                device = Device.objects.filter(username=username).first()

                
                if not device:
                    missing_devices.add(username)
                    continue
                
                notifications.append(result)
            elif len(full_names) == 2:
                conductor, householder = full_names
                for name in [conductor, householder]:
                    username = name
                    device = Device.objects.filter(username=username).first()
                    if not device:
                        missing_devices.add(username)
                        continue
                    is_conductor = username == conductor
                    first_name = device.username.split(' ')[0] if device.username else ''
                    display_title = (
                        f"Hi {first_name}, you have the part \" {part_title} \" 🌾" if is_conductor else f"Hi {first_name}, you are the householder for {part_title} 🌾"
                    )
                    with_whom = householder if is_conductor else conductor

                    result = send_push(device.fcm_token, schedule.date, f"{display_title} {duration} with {with_whom}")
                    notifications.append(result)

        # --- Treasures Talk parts ---
        bible_reader = Treasures.objects.filter(schedule=schedule).first()
        if bible_reader:
            device = Device.objects.filter(username=bible_reader.bible_reading).first()
            if device:
                result = send_push(device.fcm_token, schedule.date, f'You have the Bible Reading 📖')
                notifications.append(result)
            else:
                missing_devices.add(bible_reader.bible_reading)

            treasure_parts = TreasuresTalkInfo.objects.filter(talk__treasure_week__schedule=schedule)
            for part in treasure_parts:
                username = part.speaker
                device = Device.objects.filter(username=username).first()
                if not device:
                    missing_devices.add(username)
                    continue

                part_title = part.talk.title
                result = send_push(device.fcm_token, schedule.date, f'You have the Treasures 💎 part " {part_title} " ')
                notifications.append(result)

        # --- Living Talk parts ---
        living_parts = LivingTalkInfo.objects.filter(living_section__section__schedule=schedule)
        for part in living_parts:
            username = part.speaker
            part_title = part.living_section.title
            device = Device.objects.filter(username=username).first()
            if not device:
                missing_devices.add(username)
                continue
            first_name = device.username.split(' ')[0] if device.username else ''
            result = send_push(device.fcm_token, schedule.date, f"Hi {first_name}, You have the Living As Christians part ' {part_title} '")
            notifications.append(result)

        # --- Bible Study Conductors ---
        bible_parts = BibleStudyInfo.objects.filter(living_section__section__schedule=schedule)
        for part in bible_parts:
            conductor = part.conductor
            device = Device.objects.filter(username=conductor).first()
            if device:
                first_name = device.username.split(' ')[0] if device.username else ''
                result = send_push(device.fcm_token, schedule.date, f"Hi {first_name}, You are the conductor for the Congregation Bible Study 📚")
                notifications.append(result)
            else:
                missing_devices.add(conductor)

            reader = part.reader
            device = Device.objects.filter(username=reader).first()
            if device:
                first_name = device.username.split(' ')[0] if device.username else ''
                result = send_push(device.fcm_token, schedule.date, f'Hi {first_name}, you are the reader for the Congregation Bible Study')
                notifications.append(result)
            else:
                missing_devices.add(reader)

    if missing_devices:
        print(f"Warning: No devices found for usernames: {', '.join(missing_devices)}")
    print(notifications)

    return Response({"notifications": notifications})