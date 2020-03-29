from django.urls import path
import user.views

urlpatterns = [
    path('', user.views.info, name='index'),
    path('signup', user.views.signup, name='signup'),
    path('login', user.views.do_login, name='login'),
    path('logout', user.views.do_logout, name='logout'),
    path('save_result', user.views.save_match_result, name='save_result')

]

