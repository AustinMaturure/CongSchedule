# Generated by Django 5.1.7 on 2025-04-02 06:07

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0023_alter_assignedduties_type'),
    ]

    operations = [
        migrations.DeleteModel(
            name='AssignedPart',
        ),
        migrations.AlterField(
            model_name='publictalk',
            name='speaker',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedule.assignedduties'),
        ),
        migrations.AlterField(
            model_name='watchtowerstudy',
            name='conductor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedule.assignedduties'),
        ),
        migrations.AlterField(
            model_name='assignedduties',
            name='type',
            field=models.CharField(choices=[('Brother', 'Brother'), ('Sister', 'Sister'), ('Appointed Brother', 'Appointed Brother')], default='Brother', max_length=100),
        ),
        migrations.AlterField(
            model_name='watchtowerstudy',
            name='reader',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Reader', to='schedule.assignedduties'),
        ),
        migrations.DeleteModel(
            name='AssignedPublic',
        ),
    ]
