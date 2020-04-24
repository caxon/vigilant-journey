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


def room(request, room_id=None):
    if request.method == 'POST':
        # player1 = escape(request.POST['player1'])
        # player2 = escape(request.POST['player2'])
        print(request.body)
        state = json.loads(request.body.decode("utf-8"))
        player1 = state['player1']
        player2 = state['player2']

        player1_model = GamePlayer(
            x=player1['x'],
            y=player1['y'],
            z=player1['z']
        )

        player2_model = GamePlayer(
            x=player2['x'],
            y=player2['y'],
            z=player2['z']
        )

        players = {'player1': player1_model, 'player2': player2_model}


        room_name_hash = hash(room_id+0.1)

        game_state = GameLobby(
            players=players,
            room_name=room_name_hash
        )

        game_state.save()
        return render(request, '../templates/gamestate/saved.html', {
            'room_name_hash': room_name_hash
        })


    return render(request, '../templates/gamestate/room.html', {
        'room_id': room_id
    })
