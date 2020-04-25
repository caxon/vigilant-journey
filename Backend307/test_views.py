from django.test import TestCase
from django.test import Client
from user.views import *

class ViewTest(TestCase):
  def setUp(self):
    self.client = Client()
  #Checking that webpages are handled and user is sent to some page (status =/= 404)
  #Valid Login/Signup
  def test_logged(self):
      response = self.client.post('/login',{'username':"asdfasdf",'password':'asdfasdf'})
      self.assertEqual(response.status_code, 200)
  def test_signed(self): #redirects to login page
    response = self.client.post('/signup',{'username':"123",'email':"123@123.123",'password':'123','password_confirm':"123"})
    self.assertEqual(response.status_code, 302)
  #Invalid Login 
  def test_badpassword(self):
      response = self.client.post('/login',{'username':"asdfasdf",'password':'asdf'})
      self.assertEqual(response.status_code, 200) 
  def test_badusername(self):
      response = self.client.post('/login',{'username':"",'password':'asdf'})
      self.assertEqual(response.status_code, 200)
  #Invalid Signup 
  def test_mismatchedpassword(self):
      response = self.client.post('/signup',{'username':"123",'email':"123@123.123",'password':'123','password_confirm':"123123"})
      self.assertEqual(response.status_code, 200) 