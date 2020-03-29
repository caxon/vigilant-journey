from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth.models import User


class GetOrNoneManager(models.Manager):
    """Adds get_or_none method to objects
    https://stackoverflow.com/questions/1512059/django-get-an-object-form-the-db-or-none-if-nothing-matches
    """
    def get_or_none(self, **kwargs):
        try:
            return self.get(**kwargs)
        except self.model.DoesNotExist:
            return None



class GameLobby(models.Model):
    room_name = models.CharField(max_length=20)
    game_status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    game_started = models.BooleanField(default=False)

    def as_json(self):
        return dict(
            id=self.id,
            game_status=self.game_status,
            room_name=self.room_name,
            game_started=self.game_started,
            users=[user.as_json for user in self.players.all()]
        )


# TODO: Placeholder here, need to determine the attributes
class GamePlayer(models.Model):
    score = models.IntegerField(default=0)
    winner = models.BooleanField(default=False)

    user = models.ForeignKey(
        User,
        related_name="game_players",
        on_delete=models.CASCADE,
        default=""
    )

    gamelobby = models.ForeignKey(
        GameLobby,
        related_name="game_lobby",
        on_delete=models.CASCADE
    )
    objects = GetOrNoneManager()

    def as_json(self):
        return dict(
            id=self.id,
            winner=self.winner,
            score=self.score,
            username=self.user.username,
        )



