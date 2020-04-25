from django import forms
import json

class GameStateForm(forms.Form):

    player1 = forms.CharField(max_length=1024)
    player2 = forms.CharField(max_length=1024)
    currentScore = forms.CharField(max_length=1024)
    opponentScore = forms.CharField(max_length=1024)
    end = forms.CharField(max_length=1024)


    def clean(self):
        p1_data = self.cleaned_data['player1']
        p2_data = self.cleaned_data['player2']
        score_data = self.cleaned_data['currentScore']
        p2_score = self.cleaned_data['opponentScore']
        end = self.cleaned_data['end']

        try:
            # print(p1_data)
            json_p1 = json.loads(p1_data)
            json_p2 = json.loads(p2_data)
            json_score = json.loads(score_data)
            json_p2score = json.loads(p2_score)

        except:
            raise forms.ValidationError("invalid data")

        return {'player1': p1_data, 'player2': p2_data, 'currentScore':score_data, 'opponentScore':p2_score,'end':end}

class LoadGameForm(forms.Form):
    game_id = forms.CharField(max_length=1024)

    def clean(self):
        game_room_id = self.changed_data['game_id']

        try:
            # print(p1_data)
            rmid = json.loads(game_room_id)

        except:
            raise forms.ValidationError("invalid data")

        return game_room_id

