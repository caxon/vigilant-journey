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


# Also the game state
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
            users=[user.as_json for user in self.players.all()],  # players is related name(GamePlayer)
            boxes=[box.as_json for box in self.boxes.all()],
            coins=[coin.as_json for coin in self.coins.all()],

        )


# TODO: Placeholder here, need to determine the attributes
class GamePlayer(models.Model):
    score = models.IntegerField(default=0)
    winner = models.BooleanField(default=False)

    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    z = models.FloatField(default=0)


    user = models.ForeignKey(
        User,
        related_name="players",
        on_delete=models.CASCADE,
        default=""
    )

    gamelobby = models.ForeignKey(
        GameLobby,
        related_name="players",
        on_delete=models.CASCADE
    )

    def as_json(self):
        return dict(
            id=self.id,
            winner=self.winner,
            score=self.score,
            username=self.user.username,
            x=self.x,
            y=self.y,
            z=self.z,

        )


class Box(models.Model):
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    z = models.FloatField(default=0)

    w = models.FloatField(default=0)
    h = models.FloatField(default=0)
    d = models.FloatField(default=0)

    rx = models.FloatField(default=0)
    ry = models.FloatField(default=0)
    rz = models.FloatField(default=0)

    gamelobby = models.ForeignKey(
        GameLobby,
        related_name="boxes",
        on_delete=models.CASCADE
    )

    def as_json(self):
        return dict(
            id=self.id,
            x=self.x,
            y=self.y,
            z=self.z,
            w=self.w,
            h=self.h,
            d=self.d,
            rx=self.rx,
            ry=self.ry,
            rz=self.rz
        )


class Coin(models.Model):
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    z = models.FloatField(default=0)

    interactable = models.BooleanField(default=True)
    gamelobby = models.ForeignKey(
        GameLobby,
        related_name="coins",
        on_delete=models.CASCADE
    )

    def as_json(self):
        return dict(
            id=self.id,
            x=self.x,
            y=self.y,
            z=self.z,
            interactable=self.interactable
        )


