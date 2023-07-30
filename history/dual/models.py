from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    favorites = models.ManyToManyField('Event', related_name='favorited_by', blank=True)




class Event(models.Model):
    year = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    important = models.BooleanField(default=False)
    keywords = models.CharField(max_length=200, blank=True)
    link = models.URLField(blank=True)
    image = models.URLField(blank=True)
    country = models.CharField(max_length=100)

    def __str__(self):
        return self.title

    def serialize(self):
        return {
            'year': self.year,
            'title': self.title,
            'description': self.description,
            'important': self.important,
            'id': self.id,
        }

