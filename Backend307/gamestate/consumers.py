from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
import time

# TODO: FINISH THIS
class GameConsumer(WebsocketConsumer):
    server_start = time.time()


    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = 'game_%s' % self.room_id
        self.timer = 60

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )


        user = self.scope['user']
        if user.is_authenticated:
            async_to_sync(self.channel_layer.group_add)(
                user.username,
                self.channel_name
            )

        self.accept()


    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )


    def receive(self, text_data=None, bytes_data=None):
        # Server tick.
        # if time.time() - self.last_tick_time <= 0.02:
        #     return
        # self.last_tick_time = time.time()


        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user = self.scope['user']
        player = text_data_json['player']

        if time.time() - self.server_start == 60:
            message = text_data_json['message']
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'end_game',
                    'message': message,
                    'player': text_data_json['player']
                }
            )
            return

        # print(message)
        if message == "join":
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'join_game',
                    'message': message,
                    'player': text_data_json['player']
                }
            )

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'update_game',
                'message': message,
                'player': player
            }
        )

    def update_game(self, event):
        message = event['message']
        player = event['player']

        self.send(text_data=json.dumps({
            'message': message,
            'player': player
        }))

    def join_game(self, event):
        message = event['message']

        self.send(text_data=json.dumps({
            'message': message,
            'player': event['player']
        }))

    def save_game(self, event):
        

        self.end_game(event)

    def end_game(self, event):
        message = event['message']
        self.send(text_data=json.dumps({
            'message': message,
            'player': event['player']
        }))
        





