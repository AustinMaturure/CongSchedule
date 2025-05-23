# Generated by Django 5.1.7 on 2025-03-19 07:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Apply',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('apply_part', models.CharField(max_length=255)),
                ('apply_student', models.CharField(max_length=255)),
                ('apply_duration', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Living',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('living_talk_title', models.CharField(max_length=255)),
                ('living_talk_speaker', models.CharField(max_length=255)),
                ('living_talk_duration', models.CharField(max_length=255, null=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='apply_duration',
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='apply_part',
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='apply_student',
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='living_talk_duration',
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='living_talk_speaker',
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='living_talk_title',
        ),
        migrations.AddField(
            model_name='schedule',
            name='ApplyYourself',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='schedule.apply'),
        ),
        migrations.AddField(
            model_name='schedule',
            name='Living',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='schedule.living'),
        ),
    ]
