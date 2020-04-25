from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
import time

# TODO: FINISH THIS
class GameConsumer(WebsocketConsumer):
    server_start = time.time()
    game_end = False

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

        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user = self.scope['user']
        player = text_data_json['player']
        if time.time() - self.server_start >= 110 and not self.game_end:

            message = text_data_json['message']
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'end_game',
                    'message': message,
                    'player': text_data_json['player']
                }
            )
            if time.time() - self.server_start >= 120:
                self.game_end = True
                self.disconnect(200)



        if message == "join":
            print(message)
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'join_game',
                    'message': message,
                    'player': text_data_json['player']
                }
            )

        # elif message == ""

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

        # if 'coin' in message:
        #     print(message['coin'])
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
        message['end'] = 'end'

        self.send(text_data=json.dumps({
            'message': message,
            'player': event['player']
        }))






