from django import forms
import json

class GameStateForm(forms.Form):

    player1 = forms.CharField(max_length=1024)
    player2 = forms.CharField(max_length=1024)


    def clean(self):
        p1_data = self.cleaned_data['player1']
        p2_data = self.cleaned_data['player2']

        try:
            # print(p1_data)
            json_p1 = json.loads(p1_data)
            json_p2 = json.loads(p2_data)

        except:
            raise forms.ValidationError("invalid data")

        return {'player1': p1_data, 'player2': p2_data}
