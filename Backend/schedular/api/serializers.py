from rest_framework import serializers
from schedule.models import Schedule, Apply, ApplyPart, ApplyInfo, Living, Opening, Treasures, TreasuresTalk, TreasuresTalkInfo, BibleStudy, BibleStudyInfo, LivingTalk, LivingTalkInfo, Closing




class ApplyInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplyInfo
        fields = [ 'student', 'duration']


class ApplyPartSerializer(serializers.ModelSerializer):
    apply_info = ApplyInfoSerializer(source='applyinfo_set', many=True)

    class Meta:
        model = ApplyPart
        fields = ['apply_part', 'apply_info']


class ApplySerializer(serializers.ModelSerializer):
    apply_parts = ApplyPartSerializer(many=True, source='applypart_set')

    class Meta:
        model = Apply
        fields = ['apply_parts']
   

class LivingTalkInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivingTalkInfo
        fields = ['speaker', 'duration']
        


class LivingTalkSerializer(serializers.ModelSerializer):
  
    living_talk_info = LivingTalkInfoSerializer(source='livingtalkinfo_set', many=True)

    class Meta:
        model = LivingTalk
        fields = ['title', 'living_talk_info']

class BibleStudyInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BibleStudyInfo
        fields = ['conductor','reader']


class BibleStudySerializer(serializers.ModelSerializer):
    bible_study_info = BibleStudyInfoSerializer(source="biblestudyinfo_set", many=True)

    class Meta:
        model = BibleStudy
        fields = ['title', 'bible_study_info']


class LivingSerializer(serializers.ModelSerializer):

    living_talks = LivingTalkSerializer(source='livingtalk_set', many=True)
    bible_study = BibleStudySerializer(source='biblestudy_set', many=True)

    class Meta:
        model = Living
        fields = ['living_song', 'living_talks', 'bible_study']





class TalkInfoSerializer(serializers.ModelSerializer):     
    class Meta:
        model = TreasuresTalk
        fields = ['speaker', 'duration']


class TreasuresTalkInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreasuresTalkInfo
        fields = ['speaker']


class TreasuresTalkSerializer(serializers.ModelSerializer):
    talk_info = TreasuresTalkInfoSerializer(source='treasurestalkinfo_set', many=True)

    class Meta:
        model = TreasuresTalk
        fields = ['title', 'talk_info']


class TreasuresSerializer(serializers.ModelSerializer):
    treasures_talks = TreasuresTalkSerializer(source='treasurestalk_set', many=True)

    class Meta:
        model = Treasures
        fields = ['bible_reading', 'treasures_talks']


class OpeningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opening
        fields = ['opening_prayer', 'opening_song', 'chairman']


class ClosingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Closing
        fields = ['closing_song', 'closing_prayer']


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'date']

class ScheduleDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['date']


class ScheduleResultSerializer(serializers.Serializer):
    schedule_date = serializers.CharField()
    section = serializers.CharField()
    title_or_theme = serializers.CharField()
    duration = serializers.CharField(required=False, default='N/A')
    student = serializers.CharField(required=False, default='N/A')
    reader = serializers.CharField(required=False, default='N/A')
    conductor = serializers.CharField(required=False, default='N/A')
    
     
