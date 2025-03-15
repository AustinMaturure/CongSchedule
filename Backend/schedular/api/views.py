from rest_framework.decorators import api_view
from rest_framework.response import Response
import re
from pdfminer.high_level import extract_text, extract_pages


@api_view(['GET'])
def makeSchedule(request):
    file_path = r'C:\Users\LENOVO\Github\AustinMaturure\CongSchedule\Backend\schedular\api\Piet Retief Congregation March 2025 Life and Ministry Meeting Schedule.pdf'

    text = extract_text(file_path)

    pattern = re.compile(r'(\d{2} \w+ \d{4})\s?\|\s?(.*?)(?=\d{2} \w+ \d{4}|$)', re.DOTALL)

    dates = pattern.findall(text)
    for date in dates:
        print(f'\nday: {date[0]} ')
        pattern = re.compile(r'(Song \d{1,3} - [^0-9]+)(?=\s*Prayer)(.*?)(?=\d{1,2} [A-Za-z]+ \d{4}|$)(.*)')
        content = re.findall(pattern, date[1])

        for song in content:
            print(f"Song: {song[0]}")
            pattern = re.compile(r'(Prayer([A-Za-z\s]+)(?=\d|[^\w\s]))', re.DOTALL)

            praying = re.search(pattern, song[1])
            print(f'Opnening Prayer: {praying.group(2)} ' )

            cpattern = re.compile(r'Chairman([A-Za-z\s\']+)(?=Treasures from God\'s Word)', re.DOTALL)
            chairman = re.search(cpattern, song[1])
            print(f'Chairman: {chairman.group(1)}' )

            tpattern = re.compile(r"Treasures from God's Word(.*?)Apply Yourself to the Field Ministry", re.DOTALL)
            treasures = re.search(tpattern, song[1])
           

            ppattern = re.compile(r'([A-Za-z\s\'\""()?!:;“”\d]+)(?=\(\d+ min\.\))(\(\d+ min\.\)(.*?)(?=\d{2}:\d{2}(\d+)))', re.DOTALL)
            apply = re.findall(ppattern, treasures.group(1))

          
            for app in apply:
                print(f'Apply: {app[0]} - {app[2]}' )

            rpattern = re.compile(r"Bible Reading \(\d+ min\.\)(.*)", re.DOTALL)
            biblereader = re.search(rpattern, treasures.group(1))
            print(f'Bible Reading: {biblereader.group(1)}' )

            

            



          
           
            


       
  
   
        
    
    
    return Response(text)