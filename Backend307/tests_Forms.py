from django.test import TestCase
from django.contrib.auth.models import User
from user.forms import *

class LoginForm_Test(TestCase):
  #SetUp
  def setUp(self):
    self.user = User.objects.create(username="username",password="password")
  #Valid Form Data
  def test_LoginForm_valid(self):
    form=LoginForm(data={
      'username':"username",
      'password':"password"})
    self.assertTrue(form.is_valid())
  #Invalid Form Data
  def test_LoginForm_noUsername(self):
    form=LoginForm(data={
      'username':"",
      'password':"password"})
    self.assertFalse(form.is_valid())
  def test_LoginForm_noPassword(self):
    form=LoginForm(data={
      'username':"username",
      'password':""})
    self.assertFalse(form.is_valid())
    
class SignupForm_Test(TestCase):
  #SetUp
  def setUp(self):
    self.user = User.objects.create(username="username",email="asdf@asdf.asdf",password="password")
  #Valid Form Data
  def test_SignupForm_valid(self):
    form=SignupForm(data={
      'username':"username",
      'email':"asdf@asdf.asdf",
      'password':"password",
      'password_confirm':"password"})
    self.assertTrue(form.is_valid())
  #Invalid Form Data
  def test_SignupForm_noUsername(self):
    form=SignupForm(data={
      'username':"",
      'email':"asdf@asdf.asdf",
      'password':"password",
      'password_confirm':"password"})
    self.assertFalse(form.is_valid())
  def test_SignupForm_noPassword(self):
    form=SignupForm(data={
      'username':"username",
      'email':"asdf@asdf.asdf",
      'password':"",
      'password_confirm':"password"})
    self.assertFalse(form.is_valid())
  def test_SignupForm_MisMatchedPassword(self):
    form=SignupForm(data={
      'username':"username",
      'email':"asdf@asdf.asdf",
      'password':"password",
      'password_confirm':"pass"})
    self.assertFalse(form.is_valid())
  def test_SignupForm_BadEmail(self):
    form=SignupForm(data={
      'username':"username",
      'email':"asdf.asdf",
      'password':"password",
      'password_confirm':"password"})
    self.assertFalse(form.is_valid())

