from django.contrib.auth.models import User
from django.db import models

class Publisher(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)