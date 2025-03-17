from rest_framework.decorators import api_view
from rest_framework.response import Response
import re
from pdfminer.high_level import extract_text, extract_pages


@api_view(['GET'])
def makeSchedule(request, week):
    file_path = r'C:\Users\LENOVO\Github\AustinMaturure\CongSchedule\Backend\schedular\api\Piet Retief Congregation March 2025 Life and Ministry Meeting Schedule.pdf'

    text = extract_text(file_path)
    text = text.replace("\u2640", "")
    text = text.replace("Printed", "")
    print(text)

    pattern = re.compile(r'(\d{2} \w+ \d{4})\s?\|\s?(.*?)(?=\d{2} \w+ \d{4}|$)', re.DOTALL)

    dates = pattern.findall(text)
    schedule = {}
    for dayindex, date in enumerate(dates):
        print(f'\nday: {date[0]} ')
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
            pattern = re.compile(r'(Prayer([A-Za-z\s]+)(?=\d|[^\w\s]))', re.DOTALL)
            day_schedule["Opening"]["Opening Song"] = song[0]

            praying = re.search(pattern, song[1])
            day_schedule["Opening"]["Opening Prayer"] = praying.group(2)
            print(day_schedule)

            cpattern = re.compile(r'Chairman([A-Za-z\s\']+)(?=Treasures from God\'s Word)', re.DOTALL)
            chairman = re.search(cpattern, song[1])
            print(f'Chairman: {chairman.group(1)}' )
            day_schedule["Opening"]["Chairman"] = chairman.group(1)


            tpattern = re.compile(r"Treasures from God's Word(.*?)Apply Yourself to the Field Ministry", re.DOTALL)
            treasures = re.search(tpattern, song[1])
          

            ppattern = re.compile(r'([A-Za-z\s\'\""()?\-!:;“”\d]+)(?=\(\d+ min\.\))(\(\d+ min\.\)(.*?)(?=\d{2}:\d{2}(\d+)))', re.DOTALL)
            apply = re.findall(ppattern, treasures.group(1))

            treasures_titles = ["Talk", "Spiritual Gems"]

            for index, app in enumerate(apply):
                day_schedule["Treasures"][treasures_titles[index]]["Title"] = app[0]  
                day_schedule["Treasures"][treasures_titles[index]]["Speaker"] = app[2]

                print(f'{treasures_titles[index]}: {app[0]} - {app[2]}')
               

            rpattern = re.compile(r"Bible Reading \(\d+ min\.\)(.*)", re.DOTALL)

            biblereader = re.search(rpattern, treasures.group(1))
            print(f'Bible Reading: {biblereader.group(1)}' )
            day_schedule['Treasures']['Bible Reading']=biblereader.group(1)

            apattern = re.compile(r"Apply Yourself to the Field Ministry(.*?)Living as Christians", re.DOTALL)
            students = re.search(apattern, song[1])

            spattern = re.compile(r'([A-Za-z\s]+)(?=\(\d+ min\.\))(\(\d+ min\.\)([A-Za-z\s&]+)(?=(\d{2}:\d{2}(\d+))|Living as Christians))', re.DOTALL)
            parts = re.findall(spattern, students.group(0))

    
            for index, part in enumerate(parts):
                day_schedule["Apply Yourself"][f'{part[0]} {index}'] = {}
                day_schedule["Apply Yourself"][f'{part[0]} {index}']["Student"]=part[2]
                day_schedule["Apply Yourself"][f'{part[0]} {index}']["Duration"]=part[1][:8]
                print(f'{part[0]}: {part[2]} - {part[1][:8]}')

            lacpattern =  re.compile(r'Living as Christians(.*)\d{2}:\d{2}Review / Preview / Announcements', re.DOTALL)
            lac = re.search(lacpattern, song[1])
    

            lacspattern = re.compile(r'(Song \d{1,3}(?: - [^0-9]+)?)(?=\d{2}:\d{2})', re.DOTALL)

            lacs = re.search(lacspattern, lac.group(1))
     
            print(f'Las Song: {lacs.group(1)}')
            day_schedule["Living as Christians"]["Song"]=lacs.group(1)
            

            lactalkspattern = re.compile(r'(\d{2}:\d{2}\d+\. )(.*?)(\(\d+ min\.\))([A-Za-z\s]+)', re.DOTALL)
            lactalks = re.findall(lactalkspattern, lac.group(1))
            

            day_schedule["Living as Christians"]["Talks"]={}
            if lactalks:
                for  talk in lactalks:
                    
                    if "Congregation Bible Study" in talk[1]:
                        bible_study = talk[3]  
                        
            
                        conducterpattern = re.compile(r'Conductor([^0-9]+)(?=Reader)', re.DOTALL)
                        conducter = re.search(conducterpattern, bible_study)
                        
      
                        readerpattern = re.compile(r'Reader([^0-9]+)$', re.DOTALL)
                        reader = re.search(readerpattern, bible_study)

                        localneeds = re.compile(r'Local Needs \(\d+ min\.\)(.*?)\d{2}:\d{2}\d+', re.DOTALL)
                        localneed = re.search(localneeds, lac.group(1))

                        if localneed: 
                            day_schedule["Living as Christians"]["Talks"]["Local Needs"]={}  
                            day_schedule["Living as Christians"]["Talks"]["Local Needs"]["Speaker"]=localneed.group(1)         
                            print(f'Local Needs: {localneed.group(1)} ')  
                        else:
                            print("No match found for Local Needs.")
                        
           
                        if conducter and reader:
                            day_schedule["Living as Christians"]["Talks"]["Congregation Bible Study"]={}
                            day_schedule["Living as Christians"]["Talks"]["Congregation Bible Study"]["Conductor"]=conducter.group(1).strip()
                            day_schedule["Living as Christians"]["Talks"]["Congregation Bible Study"]["Reader"]=reader.group(1).strip()
                            print(f'Congregation Bible Study: Conductor - {conducter.group(1).strip()}, Reader - {reader.group(1).strip()}')
                        else:
                            print("Conductor or Reader information not found.")
                        
                        
                        
                        
                  
                    else:
                        day_schedule["Living as Christians"]["Talks"][talk[1]]={}
                        day_schedule["Living as Christians"]["Talks"][talk[1]]["Speaker"]=talk[3]
                        day_schedule["Living as Christians"]["Talks"][talk[1]]["Duration"]=talk[2]
                        print(f'Talk: {talk[1]} - {talk[3]} - {talk[2]}')
            else:
                print("No talks found.")

            endpattern = re.compile(r'Review / Preview / Announcements \(3 min\.\)\d{2}:\d{2}(Song \d{1,3} - [^0-9]+)(Prayer([A-Za-z\s]+))')

            match = re.search(endpattern, song[1])
            print(match.group(1))
            day_schedule["Closing"]["Closing Song"] = match.group(1)

            praying = re.search(pattern, song[1])
            
            prayerpattern = re.compile(r'Prayer([A-Za-z\s]+)(\u2640|\x0c|\f)?[^A-Za-z\s]*')
            prayer = match.group(2)
            prayerclose = re.search(prayerpattern, prayer)


            if prayerclose:
                day_schedule["Closing"]["Closing Prayer"] = prayerclose.group(1)
                print(f'Closing Prayer: {prayerclose.group(1)}')
         
        schedule[dayindex] = day_schedule
        
    
              
    if week in schedule:
        return Response(schedule[week])
    else:
        return Response({"error": "Week not found"}, status=404)