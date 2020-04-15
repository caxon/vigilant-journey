from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json

# TODO: FINISH THIS
class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_id = 'game_%d' % self.room_id

        # Join room group
        # async_to_sync turns an awaitable function to a synced callable
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_id,
            self.channel_name
        )

        user = self.scope['user']
        if user.is_authenticated:
            async_to_sync(self.channel_layer.group_add)(
                user.username,
                self.channel_name
            )
        self.accept()


    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_id,
            self.channel_name
        )

    def join_game(self):
        pass

    def receive(self, text_data=None, bytes_data=None):
        content = json.loads(text_data)
        msg_type = content["type"]
        msg = content["message"]





    def update_game(self, event):
        state = event["state"]
        async_to_sync(self.send)(json.dumps(state))

