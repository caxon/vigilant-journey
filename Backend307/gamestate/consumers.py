from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json

# TODO: FINISH THIS
class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = 'game_%s' % self.room_id

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

        if user.is_authenticated:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'message': message
                }
            )
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'message': message
                }
            )




        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'update_game',
                'message': message
            }
        )


    def update_game(self, event):
        message = event['message']

        self.send(text_data=json.dumps({
            'message': message
        }))


    def join_game(self, event):
        message = event['message']


        self.send(text_data=json.dumps({
            'message': message
        }))




