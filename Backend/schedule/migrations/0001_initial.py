# Generated by Django 5.1.7 on 2025-03-19 07:02

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Schedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('week', models.IntegerField()),
                ('date', models.DateField()),
                ('opening_song', models.CharField(max_length=255)),
                ('opening_prayer', models.CharField(max_length=255)),
                ('chairman', models.CharField(max_length=255)),
                ('treasures_talk_title', models.CharField(max_length=255)),
                ('treasures_speaker', models.CharField(max_length=255)),
                ('treasures_spiritual_gems_title', models.CharField(max_length=255)),
                ('treasures_spiritual_gems_speaker', models.CharField(max_length=255)),
                ('bible_reading', models.CharField(max_length=255)),
                ('apply_part', models.CharField(max_length=255)),
                ('apply_student', models.CharField(max_length=255)),
                ('apply_duration', models.CharField(max_length=50)),
                ('living_song', models.CharField(max_length=255)),
                ('living_talk_title', models.CharField(max_length=255)),
                ('living_talk_speaker', models.CharField(max_length=255)),
                ('living_talk_duration', models.CharField(max_length=255, null=True)),
                ('bible_study_conductor', models.CharField(max_length=255, null=True)),
                ('bible_study_reader', models.CharField(max_length=255, null=True)),
                ('closing_song', models.CharField(max_length=255)),
                ('closing_prayer', models.CharField(max_length=255)),
            ],
        ),
    ]
