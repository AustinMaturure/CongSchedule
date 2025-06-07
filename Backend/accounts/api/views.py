from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from schedule.models import *
from .serializers import *
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['password'] = user.password
        token['id'] = user.id
            
        
        return token
    

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny]) 
def addUser(request):
    if request.method == 'POST':
        serializer = AddUserSerializer(data=request.data)
        if serializer.is_valid():
            firstname = serializer.validated_data["first_name"]
            lastname = serializer.validated_data["last_name"]
            if get_user_model().objects.filter(first_name=firstname, last_name=lastname).exists():
                return Response({'message': 'A user with that name already exists'}, status=status.HTTP_409_CONFLICT)


            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({
                'user': serializer.data,
                'access_token': access_token,
                'refresh_token': str(refresh),
            }, status=status.HTTP_201_CREATED)
      
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def Login(request):
    if request.method == 'POST':
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        password = request.data.get('password')

     
        if not first_name or not last_name or not password:
            return Response({'message': 'First name and last name are required'}, status=status.HTTP_400_BAD_REQUEST)

  
        username = first_name +  last_name
        
      
        user = authenticate(request, username=username, password=password)

        if user is not None:
           
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'access_token': access_token,
                'refresh_token': str(refresh),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
 

