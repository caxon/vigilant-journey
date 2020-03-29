from django import forms
from django.core.exceptions import ValidationError
# from .models import MatchHistory
from django.forms import ModelForm


class SignupForm(forms.Form):
    username = forms.CharField()

    email = forms.EmailField()

    password = forms.CharField()
    password_confirm = forms.CharField()

    def clean(self):
        cleaned_data = super(SignupForm, self).clean()

        if ('password' in cleaned_data and 'password_confirm' in cleaned_data) and (cleaned_data['password'] != cleaned_data['password_confirm']):
            self.add_error('password_confirm', 'Password do not match')

        return cleaned_data


class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField()




