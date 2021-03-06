from django.shortcuts import render

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.utils.html import escape, escapejs
from .models import *
import json
from . import forms
import random

# Create your views here.
def index(request):
    context = {}
    return render(request, '../templates/gamestate/index.html', context)

@login_required #enforces login (?)
def room(request, room_id=None):
    context = {}
    user = None
    if request.user.is_authenticated:
        user = request.user


    if request.method == 'POST':
        form = forms.GameStateForm(request.POST)

        if form.is_valid():
            player1 = form.cleaned_data['player1']
            player2 = form.cleaned_data['player2']
            currentScore = form.cleaned_data['currentScore']
            opponentScore = form.cleaned_data['opponentScore']
            end = form.cleaned_data['end']

            player1 = json.loads(player1)
            player2 = json.loads(player2)
            print(player1)
            print(player2)

            #saving highscore
            if int(currentScore)>int(user.profile.highscore):
                user.profile.highscore = int(currentScore)
                user.save()

            #updating win/loss total if the game has ended
            if end != "0":
                print("game done")
                context['result']= "tied"
                if int(currentScore)>int(opponentScore):
                    user.profile.wins = user.profile.wins+1
                    user.save()
                    context['result']= "won"
                elif int(currentScore)<int(opponentScore):
                    user.profile.losses = user.profile.losses+1
                    user.save()
                    context['result']= "lost"
                return render(request, '../templates/gamestate/endgame.html', context)

            #saving game for later replay if game has not yet ended
            else:
                room_name_hash = random.randint(0, 999)
                room_name_hash = hash(room_name_hash+0.1)
                game_state = GameLobby(
                    room_name=room_name_hash,
                )

                game_state.save()
                player1_model = GamePlayer(
                    x=player1['x'],
                    y=player1['y'],
                    z=player1['z'],

                )

                player2_model = GamePlayer(
                    x=player2['x'],
                    y=player2['y'],
                    z=player2['z']
                )

                game_state.players.add(player1_model, bulk=False)
                game_state.players.add(player2_model, bulk=False)

                player1_model.save()
                player2_model.save()

                print(game_state.as_json()['users'][0])
                return render(request, '../templates/gamestate/saved.html', game_state.as_json())


    return render(request, '../templates/gamestate/room.html', {
        'room_id': room_id
    })


def load_game(request):
    context = {}
    if request.method == 'POST':
        room_name = request.POST['room_id']
        try:
            room_obj = GameLobby.objects.get(room_name=room_name).as_json()
            print(room_obj)
            context['loaded_room'] = room_obj
            return render(request, '../templates/gamestate/room.html', context)
        except:
            print("lobby not found")

    return render(request, '../templates/user/main.html', context)