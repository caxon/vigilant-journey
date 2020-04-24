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

# Create your views here.
def index(request):
    context = {}
    return render(request, '../templates/gamestate/index.html', context)

@login_required #enforces login (?)
def room(request, room_id=None):
    user = None
    if request.user.is_authenticated:
        user = request.user

    if request.method == 'POST':
        # player1 = escape(request.POST['player1'])
        # player2 = escape(request.POST['player2'])

        form = forms.GameStateForm(request.POST)



        if form.is_valid():
            player1 = form.cleaned_data['player1']
            player2 = form.cleaned_data['player2']

            player1 = json.loads(player1)
            player2 = json.loads(player2)
            print(player1)
            print(player2)

            room_name_hash = hash(room_id+0.1)

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

            user.players.add(player1_model, bulk = False)
            user.players.add(player2_model, bulk=False)
            game_state.players.add(player1_model, bulk=False)
            game_state.players.add(player2_model, bulk=False)
            # player1_model.save()
            # player2_model.save()
            
            return render(request, '../templates/gamestate/saved.html', {
                'room_name_hash': room_name_hash
            })


    return render(request, '../templates/gamestate/room.html', {
        'room_id': room_id
    })
