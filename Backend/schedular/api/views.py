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

            treasures_titles = ["Talk", "Spiritual Gems"]

            for index, app in enumerate(apply):
                print(f'{treasures_titles[index]}: {app[0]} - {app[2]}')
               

            rpattern = re.compile(r"Bible Reading \(\d+ min\.\)(.*)", re.DOTALL)
            biblereader = re.search(rpattern, treasures.group(1))
            print(f'Bible Reading: {biblereader.group(1)}' )

            apattern = re.compile(r"Apply Yourself to the Field Ministry(.*?)Living as Christians", re.DOTALL)
            students = re.search(apattern, song[1])
        

         

            spattern = re.compile(r'([A-Za-z\s]+)(?=\(\d+ min\.\))(\(\d+ min\.\)([A-Za-z\s&]+)(?=(\d{2}:\d{2}(\d+))|Living as Christians))', re.DOTALL)
            parts = re.findall(spattern, students.group(0))

    
            for part in parts:
                print(f'{part[0]}: {part[2]}')

            lacpattern =  re.compile(r'Living as Christians(.*)\d{2}:\d{2}Review', re.DOTALL)
            lac = re.search(lacpattern, song[1])
    

            lacspattern = re.compile(r'(Song \d{1,3} - [^0-9]+)(?=\d{2}:\d{2}(\d+))', re.DOTALL)

            lacs = re.search(lacspattern, lac.group(1))
            print(f'Las Song: {lacs.group(1)}')
            

            lactalkspattern = re.compile(r'(\d{2}:\d{2}\d+)(.*?)\(\d+ min\.\)([A-Za-z\s]+)', re.DOTALL)
            lactalks = re.findall(lactalkspattern, lac.group(1))

            if lactalks:
                for  talk in lactalks:
                    if "Congregation Bible Study" in talk[1]:
                        bible_study = talk[2]  # Speaker information part
                        
                        # Regex pattern to extract the conductor
                        conducterpattern = re.compile(r'Conductor([^0-9]+)(?=Reader)', re.DOTALL)
                        conducter = re.search(conducterpattern, bible_study)
                        
      
                        readerpattern = re.compile(r'Reader([^0-9]+)$', re.DOTALL)
                        reader = re.search(readerpattern, bible_study)
                        
           
                        if conducter and reader:
                            print(f'Congregation Bible Study: Conductor - {conducter.group(1).strip()}, Reader - {reader.group(1).strip()}')
                        else:
                            print("Conductor or Reader information not found.")
                  
                    else:
                        print(f'Talk: {talk[1]} - {talk[2]}')
            else:
                print("No talks found.")

            

       
           

            

            



          
           
            


       
  
   
        
    
    
    return Response(text)