# Generated by Django 5.1.7 on 2025-04-02 16:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0028_rename_full_name_apponitedbrother_brother'),
    ]

    operations = [
        migrations.AddField(
            model_name='dutyassignment',
            name='sundayschedule',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='schedule.sundayschedule'),
        ),
        migrations.AlterField(
            model_name='publictalk',
            name='speaker',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedule.apponitedbrother'),
        ),
    ]
