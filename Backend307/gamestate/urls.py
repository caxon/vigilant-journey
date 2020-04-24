from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import *


# TODO: Finish views
urlpatterns = [
    path("user/", index), # User stats
    path("<int:room_id>/", room), # Game lobby
    path("gamelist", index), # lobby list
    path("", room),
    path("load", load_game, name="load")
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)