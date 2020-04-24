from django.db import models
from django.contrib.auth.models import User
from django.forms import ModelForm
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

# class MatchHistory(models.Model):
#     username_1 = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='user1')
#     # username_2 = models.CharField(max_length=100)
#     username_2 = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='user2')
#     match_time = models.DateTimeField(auto_now_add=True)
#     # winner = models.CharField(max_length=100)
#     winner = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='winner')


class Profile(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  bio = models.TextField(max_length=500, blank=True)
  highscore = models.IntegerField(default=0, blank=True)
  wins = models.IntegerField(default=0, blank=True)
  losses = models.IntegerField(default=0, blank=True)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
  if created:
    Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
  instance.profile.save()


