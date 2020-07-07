// Global Variables
const API_KEY = 'AIzaSyBf5E9ymEYBv6mAi78mFBOn8oUVvO8sph4';

/** Initial display of screen */
function initialDisplay() {
  initMap();
  // This function is located in profileScript.js
  navbarLoginDisplay(); 
}

/** Initializes map and displays it. */
function initMap() {
  geocoder = new google.maps.Geocoder();
  newCenterId = sessionStorage.getItem('currentLocationId');
  mapCenter = { lat: -34.937, lng: 150.644 };
  
  const map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 14
  })

  // Checks to see if location was clicked from users saved interests
  if (newCenterId) {
    geocoder.geocode( {'placeId' : newCenterId}, function(results, status) {
      if (status == "OK") {
        mapCenter = results[0].geometry.location;
      }
      else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    })
  }
  // Checks if browser supports geolocation.
  else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow = new google.maps.InfoWindow;
      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
      map.addListener('click', function(e) {
        fetchPlaceInformation(e.placeId);
      });
      }, function() {
        handleLocationError(true, map.getCenter());
      });
  } else {
    // Browser does not support Geolocation.
    handleLocationError(false, map.getCenter());
  }
}

/** Handles any errors that have to do with geolocation. */
function handleLocationError(browserHasGeolocation, pos) {
  infoWindow.setContent(browserHasGeolocation ? 
    'Error: The Geolocation service failed.' :
    'Error: Your browser does not suppor geolocation.'
    );
  infoWindow.open(map);
}

/** Fetches information about a place. */
function fetchPlaceInformation(place_id) {
  // Not sure if I am allowed to use a heroku proxy for this request.
  // Without the proxy, the data returned by the request is blocked.
  // With the proxy, it seems to work fine 
  // TODO: ask VSE about this when they become available.
  detailFinder = google.maps.places.PlaceDetailsRequest()
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  let headers = new Headers();
  headers.append('Access-Control-Allow-Origin','*');
  let requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  }
  var fetchUrl = 'https://maps.googleapis.com/maps/';
  fetchUrl += 'api/place/details/json?place_id='+ place_id;
  fetchUrl += '&fields=name,rating,formatted_address,website,business_status';
  fetchUrl += '&key=' + API_KEY;
  fetch(fetchUrl, requestOptions)//(proxyUrl + fetchUrl)
  .then(response => response.json())
  .then(result => { 
    sessionStorage.setItem('locationName', result.result.name);
    sessionStorage.setItem('placeId', place_id);
    sideBarElement = document.getElementById('side');
    infoDivElement = document.getElementById('place-info');
    infoDivElement.innerHTML = '';
    
    nameElement = document.createElement('p');
    ratingElement = document.createElement('p');
    addressElement = document.createElement('p');
    websiteElement = document.createElement('a');
    createEventElement = document.createElement('a');
    businessStatusElement = document.createElement('p');
    saveInterestButtonElement = document.createElement('button');    
    
    nameElement.innerText = 'Name: ' + result.result.name;
    ratingElement.innerText = 'Rating: ' + result.result.rating;
    addressElement.innerText = 'Address: ' + result.result.formatted_address;
    websiteElement.innerText = result.result.website;
    websiteElement.href = result.result.website;
    createEventElement.innerText = 'Create an Event';
    createEventElement.href = 'CreateAnEvent.html';
    saveInterestButtonElement.innerText = 'Interested';
    saveInterestButtonElement.addEventListener('click', () => {
      saveInterest(result.result.name);
    });
    businessStatusElement.innerText = 'Business Status: ' + result.result.business_status;
    infoDivElement.appendChild(nameElement);
    infoDivElement.appendChild(ratingElement);
    infoDivElement.appendChild(addressElement);
    infoDivElement.appendChild(websiteElement);
    infoDivElement.appendChild(businessStatusElement);
    infoDivElement.appendChild(getAvailableEvents());
    userIsLoggedIn().then( loginStatus => {
      if (loginStatus) {
        getEvents();
        infoDivElement.appendChild(createEventElement);
        infoDivElement.appendChild(saveInterestButtonElement);
        infoDivElement.appendChild(getUserPosts());
      }
    });
    sideBarElement.appendChild(infoDivElement);
    return sideBarElement;
  })
}

/** Makes place_id and location name of a place available. */
function getLocationInfo() {
  locationInputElement = document.getElementById('location');
  placeIdInputElement = document.getElementById('placeId');
  locationName = sessionStorage.getItem('locationName');
  placeId = sessionStorage.getItem('placeId');
  console.log(placeId);
  locationInputElement.value = locationName;
  placeIdInputElement.value = placeId;
}

/** Gets user posts. */
function getUserPosts() {
  const testPosts = [
    "Test Post 1",
    "Test Post 2",
    "Test Post 3",
    "Test Post 4"
  ];
  userPostDivElement = document.createElement('div');
  for (i = 0; i < testPosts.length; i ++) {
    userPostElement = document.createElement('p');
    userPostElement.innerText = testPosts[i];
    userPostDivElement.appendChild(userPostElement);
  }
  return userPostDivElement;
}

/**
  Gets events the user is allowed to see
*/
function getAvailableEvents() {
  eventDivElement = document.createElement("div");
  locationName = sessionStorage.getItem('locationName');
  fetch("events")
    .then(response => response.json())
    .then(events => {
      for (i = 0; i < events.length; i++) {
        if (events[i].location = locationName) {
          if (events[i].privacy = "public") {
            eventDivElement.appendChild(createEvent(events[i]));
          }
        }
      }
    });
  return eventDivElement;
}

function createEvent(event) {
  const eventName = document.createElement('h3');
  eventName.innerText = event.eventName;
  const eventLocation = document.createElement('p');
  eventLocation.innerText = event.location;
  const eventDetails = document.createElement('p'); 
  eventDetails.innerText = event.eventDetails;

  const eventElement = document.createElement('div');
  eventElement.append(eventName);
  eventElement.append(eventLocation);
  eventElement.append(eventDetails);
  return eventElement;
}

/** Checks to see if a user is logged in. */
function userIsLoggedIn() {
   return fetch('/login')
  .then(response => response.json())
  .then(json => { 
    return json['loginStatus'] == 'true' 
  });
}

/** Sends post request to store saved interest. */
function saveInterest(locationName, placeId) {
  const params = new URLSearchParams()
  params.append('place-id', placeId);
  params.append('location-name', locationName);
  fetch('/interest', {
    method: 'POST', body: params
  });
}
