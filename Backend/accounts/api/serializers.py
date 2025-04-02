from rest_framework import serializers
from schedule.models import Schedule, Apply, ApplyPart, ApplyInfo, Living, Opening, Treasures, TreasuresTalk, TreasuresTalkInfo, BibleStudy, BibleStudyInfo, LivingTalk, LivingTalkInfo, Closing
from django.contrib.auth import get_user_model

class AddUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = get_user_model()
        fields = ('first_name', 'last_name', 'password')

    

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
            username=validated_data["first_name"]+validated_data["last_name"]
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('username','first_name', 'last_name', 'password')

    