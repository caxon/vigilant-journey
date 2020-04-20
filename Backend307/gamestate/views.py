from django.shortcuts import render

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.utils.html import escape
from .models import *


# Create your views here.
def index(request):
    context = {}
    return render(request, '../templates/gamestate/index.html', context)

def room(request, room_id=None):
    return render(request, '../templates/gamestate/room.html', {
        'room_id': room_id
    })
