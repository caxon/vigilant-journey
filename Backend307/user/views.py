from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.utils.html import escape
from . import forms
from .models import *
from gamestate.models import *

# Create your views here.

def info(request):
    context={}
    if not request.user.is_authenticated:
        return render(request, '../templates/user/index.html', context)
    return render(request, '../templates/user/main.html', context)

def index(request):
    context={}
    return render(request, '../templates/user/index.html', context)

def main(request):
    context={}
    if request.method == 'POST':
        form = forms.JoinRoomForm(request.POST)
    ################needs to be fixed
        if form.is_valid():
            print(roomcode)
            roomcode=form.cleaned_data['roomcode']
            return render(request, '../game/'+roomcode+"/", context)
        else: form.add_error('roomcode', 'Error, please try again')
        context['form'] = form
    return render(request, '../templates/user/main.html', context)

########## needs  to be fixed
def get_stats(request):
    context={}
    if not request.user.is_authenticated:
        return render(request, '../templates/user/index.html', context)
    return render(request, '../templates/user/stats.html', context)

def signup(request):
    context = {}
    if request.method == 'POST':
        form = forms.SignupForm(request.POST)
        if form.is_valid():
            try:
                user = User.objects.create_user(
                    form.cleaned_data['username'],
                    email=form.cleaned_data['email'],
                    password=form.cleaned_data['password']
                )
                # TODO: login page
                return HttpResponseRedirect(reverse('login'))
            except IntegrityError:
                form.add_error('username', 'Username is taken')

        context['form'] = form

    # using template, 'user/signup.html' should be in template folder
    return render(request, '../templates/user/signup.html', context)


def do_login(request):
    context={}
    if request.method == 'POST':
        form = forms.LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(request,
                                username=form.cleaned_data['username'],
                                password=form.cleaned_data['password'])
            if user is not None:
                login(request, user)
                if 'next' in request.GET:
                    return HttpResponseRedirect(request.GET['next'])
                return HttpResponseRedirect(reverse('info'))
            else:
                form.add_error(None, 'Unable to log in')

        context['form'] = form
    return render(request, '../templates/user/login.html', context)


def do_logout(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))


# To be called by the front end after a match finishes.
def save_match_result(request):
    context = {}
    if request.method == 'POST':
        user1 = escape(request.POST['username_1'])
        user2 = escape(request.POST['username_2'])
        winner = escape(request.POST['winner'])

        # match = MatchHistory(
        #     username_1=request.user,
        #     username_2=user2,
        #     winner=winner
        # )

        # match.save()
        return HttpResponse('Match result saved')

    return render(request, '../templates/user/save_result.html', context)

def joinRoom(request):
    context={}
    print(roomcode)
    if request.method == 'POST':
        form = forms.JoinRoomForm(request.POST)
        ################needs to be fixed
        if form.is_valid():
            roomcode=form.cleaned_data['roomcode']
            print("validform"+roomcodes)
            return render(request, '../room/'+roomcode, context)
        else: form.add_error('roomcode', 'Error, please try again')
        context['form'] = form
    return render(request, '../templates/user/main.html', context)


def load_game(request):
    context = {}
    if request.method == 'POST':
        room_name = request.POST['room_id']
        try:
            room_obj = GameLobby.objects.get(room_name=room_name).as_json()
            context['loaded_room'] = room_obj
        except:
            context['loaded_room'] = "Lobby not found"
        # print(GameLobby.objects.get(room_name=room_name).as_json())

    return render(request, '../templates/gamestate/load.html', context)
