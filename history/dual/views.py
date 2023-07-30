from .models import *
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.serializers import serialize
import requests

# Create your views here.


def load_event(request):
    country_a = request.GET.get('country_a')
    country_b = request.GET.get('country_b')
    start_year = int(request.GET.get('start_year'))
    end_year = int(request.GET.get('end_year'))

    events_a = Event.objects.filter(
        year__range=(start_year, end_year),
        country=country_a,
    ).order_by('year')

    events_b = Event.objects.filter(
        year__range=(start_year, end_year),
        country=country_b,
    ).order_by('year')

    data = {
        'events_a': serialize_events(events_a),
        'events_b': serialize_events(events_b),
    }

    return JsonResponse(data)


def load_single_event(request):
    event_id = request.GET.get('event_id')

    try:
        event = Event.objects.get(id=event_id)
        
        serialized_event = {
            'id': event.id,
            'title': event.title,
            'country': event.country,
            'year': event.year,
            'description': event.description,
            'keywords': event.keywords,
            'link': event.link,
            'image': event.image,
        


        }
        data = {'event': serialized_event}



    except Event.DoesNotExist:
        data = {'event': None}

    return JsonResponse(data)


def serialize_events(events):
    serialized_events = []
    for event in events:
        serialized_events.append({
            'year': event.year,
            'title': event.title,
            'description': event.description,
            'important': event.important,
            'keywords': event.keywords,
            'link': event.link,
            'image': event.image,
            'country': event.country,
            'id': event.id,
        })
    return serialized_events


def get_form_data(request):
    # Retrieve the earliest and latest year from the events
    earliest_year = Event.objects.earliest('year').year
    latest_year = Event.objects.latest('year').year

    # Retrieve the distinct countries from the events
    countries = Event.objects.values_list('country', flat=True).distinct()

    # Retrieve all unique keywords from the events and remove duplicates
    keywords_queryset = Event.objects.values_list('keywords', flat=True).distinct()
    keywords = list(set(keyword for keywords_list in keywords_queryset for keyword in keywords_list if keyword))

    data = {
        'earliest_year': earliest_year,
        'latest_year': latest_year,
        'countries': list(countries),
        'keywords': keywords,
    }

    return JsonResponse(data)


def index(request):
    return render(request, 'dual/index.html')

def about(request):
    return render(request, 'dual/about.html')


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "dual/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "dual/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        first_name = request.POST["name"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "dual/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, )
            user.save()
        except IntegrityError:
            return render(request, "dual/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "dual/register.html")


@csrf_exempt
def add_to_favs(request, event_id):
    if request.method == 'PUT':
        event = get_object_or_404(Event, id=event_id)

        if request.user.is_authenticated:
            user = request.user
            user.favorites.add(event)
            return JsonResponse({'message': 'Event added to favorites.'})
        else:
            return JsonResponse({'error': 'User not authenticated.'}, status=401)

    return JsonResponse({'error': 'Invalid request method.'}, status=400)


@csrf_exempt
def remove_from_favs(request, event_id):
    if request.method == 'PUT':
        event = get_object_or_404(Event, id=event_id)

        if request.user.is_authenticated:
            user = request.user
            user.favorites.remove(event)
            return JsonResponse({'message': 'Event removed from favorites.'})
        else:
            return JsonResponse({'error': 'User not authenticated.'}, status=401)

    return JsonResponse({'error': 'Invalid request method.'}, status=400)


@login_required
@csrf_exempt
def profile(request):
    user = request.user

    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        # Update the fields of the user based on the data received
        user.username = data.get("username")
        user.email = data.get("email")
        user.first_name = data.get("name")
        user.last_name = data.get("surname")
        # Save the updated poster
        user.save()
        return JsonResponse({"message": "User updated successfully."})

    context = {
        'user': user,
    }

    return render(request, 'dual/profile.html', context)


@login_required
def user_favorites(request):
    user = request.user
    favorites = user.favorites.all()

    event_id = request.GET.get('event_id')
    is_favorited = favorites.filter(id=event_id).exists()

    data = {
        'is_favorited': is_favorited,
    }

    return JsonResponse(data)


@login_required
def user_fav_list(request):
    user = request.user
    favorites = user.favorites.all()

    serialized_favorites = serialize('json', favorites)

    data = {
        'favorites': serialized_favorites,
    }

    return JsonResponse(data)


def get_country_data(request, country):
    api_url = f'https://restcountries.com/v3.1/name/{country}?fields=name,flags,currencies,capital,population,coatOfArms'
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({'error': 'Failed to fetch data from the API'}, status=500)