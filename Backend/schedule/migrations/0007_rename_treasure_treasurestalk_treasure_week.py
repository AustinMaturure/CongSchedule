# Generated by Django 5.1.7 on 2025-03-19 08:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0006_remove_living_living_talk_duration_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='treasurestalk',
            old_name='treasure',
            new_name='treasure_week',
        ),
    ]
