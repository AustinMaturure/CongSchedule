# Generated by Django 5.1.7 on 2025-03-19 09:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0009_remove_apply_apply_duration_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='BibleStudy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='Congregation Bible Study', max_length=255)),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedule.living')),
            ],
        ),
        migrations.CreateModel(
            name='BibleStudyInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('conductor', models.CharField(max_length=255, null=True)),
                ('reader', models.CharField(max_length=255, null=True)),
                ('living_session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='talks', to='schedule.biblestudy')),
            ],
        ),
    ]
