from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import GameView


# TODO: Finish views
urlpatterns = [
    path("user/", GameView), # User stats
    path("game/<int:id>", GameView), # Game lobby
    path("gamelist", GameView), # lobby list
    path("", GameView)
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)