from rest_framework.decorators import api_view
from rest_framework.response import Response
import re
from pdfminer.high_level import extract_text, extract_pages


@api_view(['GET'])
def makeSchedule(request):
    file_path = r'C:\Users\LENOVO\Github\AustinMaturure\CongSchedule\Backend\schedular\api\Piet Retief Congregation March 2025 Life and Ministry Meeting Schedule.pdf'

    text = extract_text(file_path)
    print(text)
        
    
    
    return Response(text)