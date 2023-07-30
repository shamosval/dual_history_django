from django.urls import path, include
from . import views

urlpatterns = [
    # Define your project URLs here
    path('index', views.index, name='index'),
    path('about', views.about, name='about'),
    path('load_event/', views.load_event, name='load_event'),
    path('load_single_event/', views.load_single_event, name='load_single_event'),
    
    path('get_form_data/', views.get_form_data, name='get_form_data'),

    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('add_to_favs/<int:event_id>/', views.add_to_favs, name='add_to_favs'),
    path('remove_from_favs/<int:event_id>/', views.remove_from_favs, name='remove_from_favs'),
    path('profile/', views.profile, name='profile'),
    path('user_favorites/', views.user_favorites, name='user_favorites'),
    path('user_fav_list/', views.user_fav_list, name='user_fav_list'),
    path('get_country_data/<str:country>/', views.get_country_data, name='get_country_data'),

]
