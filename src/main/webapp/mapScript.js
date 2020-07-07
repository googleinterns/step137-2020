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
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.937, lng: 150.644 },
    zoom: 14
  })

  // Checks if browser supports geolocation.
  if (navigator.geolocation) {
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
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  var fetchUrl = 'https://maps.googleapis.com/maps/';
  fetchUrl += 'api/place/details/json?place_id='+ place_id;
  fetchUrl += '&fields=name,rating,formatted_address,website,business_status';
  fetchUrl += '&key=' + API_KEY;
  fetch(proxyUrl + fetchUrl)
  .then(response => response.json())
  .then(result => { 
    sessionStorage.setItem('locationName', result.result.name);
    sessionStorage.setItem('locationId', place_id);
    
    sideBarElement = document.getElementById('side');
    infoDivElement = document.getElementById('place-info');
    infoDivElement.innerHTML = '';
    
    nameElement = document.createElement('p');
    ratingElement = document.createElement('p');
    addressElement = document.createElement('p');
    websiteElement = document.createElement('a');
    eventsElement = document.createElement('h2');
    createEventElement = document.createElement('a');
    businessStatusElement = document.createElement('p');
    saveInterestButtonElement = document.createElement('button');    
    
    nameElement.innerText = 'Name: ' + result.result.name;
    ratingElement.innerText = 'Rating: ' + result.result.rating;
    addressElement.innerText = 'Address: ' + result.result.formatted_address;
    websiteElement.innerText = result.result.website;
    websiteElement.href = result.result.website;
    eventsElement.innerText = "Events at this Location:";
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
    infoDivElement.appendChild(eventsElement);
    infoDivElement.appendChild(getAvailableEvents());
    userIsLoggedIn().then( loginStatus => {
      if (loginStatus) {
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
  locationName = sessionStorage.getItem('locationName');
  locationInputElement.value = locationName;
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
  eventDivElement.innerText = '';
  locationName = sessionStorage.getItem('locationName');

  var loginStatus;
  var userID;

  fetch("/login")
    .then(response => response.json())
    .then(json => {
      loginStatus = json['loginStatus'];
      userID = json['id'];
    });
  fetch("events")
    .then(response => response.json())
    .then(events => {
      for (i = 0; i < events.length; i++) {
        if (events[i].location = locationName) {
          if (events[i].privacy == "public") {
            eventDivElement.appendChild(createEvent(events[i]));
          }
          else if (events[i].privacy == "attendees") {
            attendees = events[i].attendees;
            if (attendees.includes(userID)) {
              eventDivElement.appendChild(createEvent(events[i]));
            }
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

function userIsLoggedIn() {
   return fetch('/login')
  .then(response => response.json())
  .then(json => { 
    return json['loginStatus'] == 'true' 
  });
}

function saveInterest(locationName) {
  const params = new URLSearchParams();
  params.append('location-name', locationName);
  const request = new Request('/interest', {method: 'POST', body: params});
  fetch(request);
}
