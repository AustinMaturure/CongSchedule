from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import re
from pdfminer.high_level import extract_text, extract_pages
from schedule.models import *
from .serializers import *
from rest_framework.exceptions import NotFound
from datetime import datetime
from collections import defaultdict
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.db.models import Q





@api_view(['GET'])
@permission_classes([AllowAny]) 
def makeSchedule(request):
    file_path = ScheduleSource.objects.first().file.path
    text = extract_text(file_path)
    text = text.replace("\u2640", "")
    text = text.replace("Printed", "")

    pattern = re.compile(r'(\d{2} \w+ \d{4})\s?\|\s?(.*?)(?=\d{2} \w+ \d{4}|$)', re.DOTALL)
    dates = pattern.findall(text)
    schedule = {}

    for dayindex, date in enumerate(dates):
        print(f'\nday: {date[0]} ')
        sch, created = Schedule.objects.get_or_create(date=date[0])
        opening = Opening.objects.create(schedule=sch)
        treasures_db = Treasures.objects.create(schedule=sch)
        living_db = Living.objects.create(schedule=sch)
        closing_db = Closing.objects.create(schedule=sch)
        
        day_schedule = {
        "Date": date[0],
        "Opening": {
        },
        "Treasures":{"Talk":{"Title":"", "Speaker":""}, "Spiritual Gems":{"Title":"", "Speaker":""}, "Bible Reading":""},
        "Apply Yourself": {},
        "Living as Christians": {},
        "Closing":{}
    }
        pattern = re.compile(r'(Song \d{1,3} - [^0-9]+)(?=\s*Prayer)(.*?)(?=\d{1,2} [A-Za-z]+ \d{4}|$)(.*)')
        content = re.findall(pattern, date[1])

        for song in content:
            print(f"Song: {song[0]}")
            opening.opening_song = song[0]
            
            
            pattern = re.compile(r'(Prayer([A-Za-z\s]+)(?=\d|[^\w\s]))', re.DOTALL)
            day_schedule["Opening"]["Opening Song"] = song[0]

            praying = re.search(pattern, song[1])
            day_schedule["Opening"]["Opening Prayer"] = praying.group(2)
            opening.opening_prayer=praying.group(2)
            print(day_schedule)

            cpattern = re.compile(r'Chairman([A-Za-z\s\']+)(?=Treasures from God\'s Word)', re.DOTALL)
            chairman = re.search(cpattern, song[1])
            print(f'Chairman: {chairman.group(1)}' )
            day_schedule["Opening"]["Chairman"] = chairman.group(1)
            opening.chairman = chairman.group(1)
            opening.save()


            tpattern = re.compile(r"Treasures from God's Word(.*?)Apply Yourself to the Field Ministry", re.DOTALL)
            treasures = re.search(tpattern, song[1])
          

            ppattern = re.compile(r'([A-Za-z\s\'\""()?\-!:;“”\d]+)(?=\(\d+ min\.\))(\(\d+ min\.\)(.*?)(?=\d{2}:\d{2}(\d+)))', re.DOTALL)
            apply = re.findall(ppattern, treasures.group(1))

            treasures_titles = ["Talk", "Spiritual Gems"]
            
            for index, app in enumerate(apply):
                day_schedule["Treasures"][treasures_titles[index]]["Title"] = app[0]  
                day_schedule["Treasures"][treasures_titles[index]]["Speaker"] = app[2]
                treasures_talk = TreasuresTalk.objects.create(treasure_week=treasures_db, title=app[0])
              
                treasures_info= TreasuresTalkInfo.objects.create(talk=treasures_talk,speaker=app[2])
                
                


                print(f'{treasures_titles[index]}: {app[0]} - {app[2]}')
               

            rpattern = re.compile(r"Bible Reading \(\d+ min\.\)(.*)", re.DOTALL)

            biblereader = re.search(rpattern, treasures.group(1))
            print(f'Bible Reading: {biblereader.group(1)}' )
            treasures_db.bible_reading=biblereader.group(1)
            treasures_db.save()
            day_schedule['Treasures']['Bible Reading']=biblereader.group(1)

            apattern = re.compile(r"Apply Yourself to the Field Ministry(.*?)Living as Christians", re.DOTALL)
            students = re.search(apattern, song[1])

            spattern = re.compile(r'([A-Za-z\s]+)(?=\(\d+ min\.\))(\(\d+ min\.\)([A-Za-z\s&]+)(?=(\d{2}:\d{2}(\d+))|Living as Christians))', re.DOTALL)
            parts = re.findall(spattern, students.group(0))
            

            applyYourself= Apply.objects.create(schedule=sch)
            for index, part in enumerate(parts):
                
                applyPart=ApplyPart.objects.create(apply_week=applyYourself, apply_part=part[0])
                applyInfo=ApplyInfo.objects.create(part=applyPart, student=part[2], duration=part[1][:8])
                day_schedule["Apply Yourself"][f'{part[0]} {index}'] = {}
                day_schedule["Apply Yourself"][f'{part[0]} {index}']["Student"]=part[2]
                day_schedule["Apply Yourself"][f'{part[0]} {index}']["Duration"]=part[1][:8]
                print(f'{part[0]}: {part[2]} - {part[1][:8]}')


            lacpattern =  re.compile(r'Living as Christians(.*)\d{2}:\d{2}Review / Preview / Announcements', re.DOTALL)
            lac = re.search(lacpattern, song[1])
    

            lacspattern = re.compile(r'(Song \d{1,3}(?: - [^0-9]+)?)(?=\d{2}:\d{2})', re.DOTALL)

            lacs = re.search(lacspattern, lac.group(1))
     
            print(f'Las Song: {lacs.group(1)}')
            living_db.living_song = lacs.group(1)
            day_schedule["Living as Christians"]["Song"]=lacs.group(1)
            

            lactalkspattern = re.compile(r'(\d{2}:\d{2}\d+\. )(.*?)(\(\d+ min\.\))([A-Za-z\s]+)', re.DOTALL)
            lactalks = re.findall(lactalkspattern, lac.group(1))
            living_db.save()

            day_schedule["Living as Christians"]["Talks"]={}
            if lactalks:
                for  talk in lactalks:
                    
                    if "Congregation Bible Study" in talk[1]:
                        bible_study = talk[3] 
                        bstudy = BibleStudy.objects.create(section=living_db)
                
                        
            
                        conducterpattern = re.compile(r'Conductor([^0-9]+)(?=Reader)', re.DOTALL)
                        conducter = re.search(conducterpattern, bible_study)
                        
      
                        readerpattern = re.compile(r'Reader([^0-9]+)$', re.DOTALL)
                        reader = re.search(readerpattern, bible_study)

                        localneeds = re.compile(r'Local Needs \(\d+ min\.\)(.*?)\d{2}:\d{2}\d+', re.DOTALL)
                        localneed = re.search(localneeds, lac.group(1))

                        if localneed: 
                            day_schedule["Living as Christians"]["Talks"]["Local Needs"]={}  
                            day_schedule["Living as Christians"]["Talks"]["Local Needs"]["Speaker"]=localneed.group(1)   
                            lneed=LivingTalk.objects.create(section=living_db, title="Local Needs")
                            lneedinfo = LivingTalkInfo.objects.create(living_section=lneed, speaker=localneed.group(1))   
                            print(f'Local Needs: {localneed.group(1)} ')  
                        else:
                            print("No match found for Local Needs.")
                        
           
                        if conducter and reader:
                            day_schedule["Living as Christians"]["Talks"]["Congregation Bible Study"]={}
                            day_schedule["Living as Christians"]["Talks"]["Congregation Bible Study"]["Conductor"]=conducter.group(1).strip()
                            day_schedule["Living as Christians"]["Talks"]["Congregation Bible Study"]["Reader"]=reader.group(1).strip()
                            livingtalk= BibleStudy.objects.create(section=living_db)
                            talkinfo = BibleStudyInfo.objects.create(living_section=bstudy, conductor=conducter.group(1).strip(), reader=reader.group(1).strip())
                            print(f'Congregation Bible Study: Conductor - {conducter.group(1).strip()}, Reader - {reader.group(1).strip()}')
                        else:
                            print("Conductor or Reader information not found.")
                        
                        
                        
                        
                  
                    else:
                        day_schedule["Living as Christians"]["Talks"][talk[1]]={}
                        day_schedule["Living as Christians"]["Talks"][talk[1]]["Speaker"]=talk[3]
                        day_schedule["Living as Christians"]["Talks"][talk[1]]["Duration"]=talk[2]
                        ltalk = LivingTalk.objects.create(section=living_db, title=talk[1])
                        talkinfo = LivingTalkInfo.objects.create(living_section=ltalk, speaker=talk[3], duration=talk[2])
                        print(f'Talk: {talk[1]} - {talk[3]} - {talk[2]}')
            else:
                print("No talks found.")

            endpattern = re.compile(r'Review / Preview / Announcements \(3 min\.\)\d{2}:\d{2}(Song \d{1,3} - [^0-9]+)(Prayer([A-Za-z\s]+))')

            match = re.search(endpattern, song[1])
            print(match.group(1))
            day_schedule["Closing"]["Closing Song"] = match.group(1)
            closing_db.closing_song = match.group(1)

            praying = re.search(pattern, song[1])
            
            prayerpattern = re.compile(r'Prayer([A-Za-z\s]+)(\u2640|\x0c|\f)?[^A-Za-z\s]*')
            prayer = match.group(2)
            prayerclose = re.search(prayerpattern, prayer)


            if prayerclose:
                day_schedule["Closing"]["Closing Prayer"] = prayerclose.group(1)
                print(f'Closing Prayer: {prayerclose.group(1)}')
                closing_db.closing_prayer = prayerclose.group(1)
            closing_db.save()
            sch.save()
        schedule[dayindex] = day_schedule
        
        
    
    return Response({"done": "Schedule Added"}, status=404)
    

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


        data = {
            "Schedule": ScheduleSerializer(schedule).data,
            "Opening": OpeningSerializer(opening).data,
            "Treasures": TreasuresSerializer(treasures).data,
            "Apply Yourself": ApplySerializer(apply).data,
            "Living as Christians": LivingSerializer(living).data,
            "Closing": ClosingSerializer(closing).data,
        }

        
        
        
        return Response(data)
    except Schedule.DoesNotExist:
        raise NotFound(detail="Schedule for the given week does not exist.")


@api_view(["GET"])
@permission_classes([AllowAny]) 
def getUserSchedule(request, firstname):
    first_name = firstname
    
    if not first_name:
        return Response({"error": "First name parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

    first_name_lower = first_name.lower()

    try:
        user = get_user_model().objects.get(first_name__iexact=first_name_lower)
    except get_user_model().objects.get(first_name__iexact=first_name_lower).DoesNotExist:

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


    all_matches = list(opening_matches) +  list(apply_info_matches) + list(treasure_talk_matches)+ list(bible_reading_matches)+ list(bible_study_matches) + list(living_talk_matches) + list(closing_matches)


    results = []
    for match in all_matches:
        result = {}
        if isinstance(match, Opening):
            result = {
                'schedule_date': match.schedule.date,
                'section': 'Opening',
                'title_or_theme': f'Opening prayer',
                
            }
        elif isinstance(match, ApplyInfo):
            result = {
                'schedule_date': match.part.apply_week.schedule.date,
                'section': 'Apply yourself to the Ministry',
                'title_or_theme': f'{match.part.apply_part}',
                'duration': match.duration if match.duration else 'N/A',
                'student': match.student,
            }
        elif isinstance(match, TreasuresTalkInfo):
            result = {
                'schedule_date': match.talk.treasure_week.schedule.date,
                'section': 'Treasures from God\'s Word',
                'title_or_theme': match.talk.title,
               
                
               
            }
        elif isinstance(match, Treasures):
            result = {
                'schedule_date': match.schedule.date,
                'section': 'Treasures from God\'s Word',
                'title_or_theme': f'Bible Reading',
                'reader': match.bible_reading if match.bible_reading else 'N/A',
                
            }
        elif isinstance(match, BibleStudyInfo):
            result = {
                'schedule_date': match.living_section.section.schedule.date,
                'section': 'Living as Christians',
                'title_or_theme': "Congregation Bible Study",
                'conductor':match.conductor,
                'reader': match.reader
                
            }
        elif isinstance(match, LivingTalkInfo):
            result = {
                'schedule_date': match.living_section.section.schedule.date,
                'section': 'Living as Christians',
                'title_or_theme': match.living_section.title,
                'duration': match.duration if match.duration else 'N/A',
            }
        elif isinstance(match, Closing):
            result = {
                'schedule_date': match.schedule.date,
                'section': 'Closing',
                'title_or_theme': f'Closing prayer',
                
            }
        results.append(result)
    def parse_date(date_str):
       
            return datetime.strptime(date_str, '%d %B %Y')

     
    sorted_results = sorted(results, key=lambda x: parse_date(x['schedule_date']))
    serializer = ScheduleResultSerializer(sorted_results, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)