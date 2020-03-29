from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

# TODO: FINISH THIS
class GameConsumer(WebsocketConsumer):
    def connect(self):
        pass

    def disconnect(self, code):
        pass

    def join_game(self):
        pass
