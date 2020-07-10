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
  newCenterId = sessionStorage.getItem('currentLocationId');
  mapCenter = { lat: -34.937, lng: 150.644 };
  infoWindow = new google.maps.InfoWindow;
  
  var map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 14
  })
  
  // Checks to see if location was clicked from users saved interests.
  if (newCenterId) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'placeId' : newCenterId}, function(results, status) {
      if (status == "OK") {
        mapCenter = results[0].geometry.location;
        infoWindow.setContent('You saved this location.');
        infoWindow.setPosition(mapCenter);
        infoWindow.open(map);
        map.setCenter(mapCenter);
        fetchPlaceInformation(newCenterId, map);

        // Remove session storage variable until saved interest is clicked from profile page again.
        sessionStorage.removeItem('currentLocationId');
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

      infoWindow.setPosition(pos);
      infoWindow.setContent('Your current location has been found.');
      infoWindow.open(map);
      map.setCenter(pos);
      }, function() {
        handleLocationError(true, map.getCenter());
      });
  } else {
    // Browser does not support Geolocation.
    handleLocationError(false, map.getCenter());
  }
  map.addListener('click', function(e) {
    fetchPlaceInformation(e.placeId, map);
  });
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
function fetchPlaceInformation(place_id, map) {
  var request = {
    placeId: place_id,
    fields: [
     'name',
     'rating',
     'formatted_address',
     'website',
     'business_status'
    ]
  };

  var service = new google.maps.places.PlacesService(map);
  service.getDetails(request, callback);

  function callback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      sessionStorage.setItem('locationName', place.name);
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
      
      nameElement.innerText = 'Name: ' + place.name;
      ratingElement.innerText = 'Rating: ' + place.rating;
      addressElement.innerText = 'Address: ' + place.formatted_address;
      websiteElement.innerText = place.website;
      websiteElement.href = place.website;
      createEventElement.innerText = 'Create an Event';
      createEventElement.href = 'CreateAnEvent.html';
      saveInterestButtonElement.innerText = 'Interested';
      saveInterestButtonElement.addEventListener('click', () => {
        saveInterest(place.name, place_id);
      });
      businessStatusElement.innerText = 'Business Status: ' + place.business_status;
      infoDivElement.appendChild(nameElement);
      infoDivElement.appendChild(ratingElement);
      infoDivElement.appendChild(addressElement);
      infoDivElement.appendChild(websiteElement);
      infoDivElement.appendChild(businessStatusElement);
      infoDivElement.appendChild(getPublicEvents());
      userIsLoggedIn().then( loginStatus => {
        if (loginStatus) {
          infoDivElement.appendChild(getAvailableEvents());
          infoDivElement.appendChild(createEventElement);
          infoDivElement.appendChild(saveInterestButtonElement);
          infoDivElement.appendChild(getUserPosts());
        }
      });
      sideBarElement.appendChild(infoDivElement);
      return sideBarElement;
    }
  }
}

/** Makes place_id and location name of a place available. */
function getLocationInfo() {
  locationInputElement = document.getElementById('location');
  placeIdInputElement = document.getElementById('placeId');
  locationName = sessionStorage.getItem('locationName');
  placeId = sessionStorage.getItem('placeId');
  locationInputElement.value = locationName;
  //TODO: add this line when invisible placeId input form is added to create event form
  //placeIdInputElement.value = placeId;
}

/** Makes map snippet for create event page. */
function createMapSnippet() {
  var geocoder = new google.maps.Geocoder();
  var locationName = sessionStorage.getItem('locationName')
  var placeId = sessionStorage.getItem('placeId');
  var infoWindow = new google.maps.InfoWindow;

  var mapSnippet = new google.maps.Map(document.getElementById('map-snippet'), {
    zoom: 16 
  });

  // Using geocode API to transform placeId into LngLat.
  geocoder.geocode( {'placeId' : placeId}, function(results, status) {
    if (status == "OK") {
      mapSnippetCenter = results[0].geometry.location;
      mapSnippet.setCenter(mapSnippetCenter);
      infoWindow.setPosition(mapSnippetCenter);
    }
    else {
      alert('Geocode was not successful for the following reason: ' + status);
      mapSnippet.setCenter( { lat: -34.937, lng: 150.644})
    }
  })

  infoWindow.setContent('Creating an event at ' + locationName);
  infoWindow.open(mapSnippet);
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
  Get all public events to display on map page even when user isn't logged in
 */
function getPublicEvents() {
  eventDivElement = document.createElement("div");
  eventDivElement.innerText = '';
  locationName = sessionStorage.getItem('locationName');

  fetch("events")
    .then(response => response.json())
    .then(events => {
      for (i = 0; i < events.length; i++) {
        if (events[i].location == locationName 
            && events[i].privacy == "public") {
            eventDivElement.appendChild(createEvent(events[i]));
          }
        }
    });
  return eventDivElement;
}

/**
  Gets events the user is allowed to see.
*/
function getAvailableEvents() {
  eventDivElement = document.createElement("div");
  eventDivElement.innerText = '';
  locationName = sessionStorage.getItem('locationName');

  var userID;

  fetch("/login")
    .then(response => response.json())
    .then(json => {
      userID = json['id'];
    });
  fetch("events")
    .then(response => response.json())
    .then(events => {
      for (i = 0; i < events.length; i++) {
        if (events[i].location == locationName) {
          if (events[i].privacy == "attendees" || events[i].privacy == "buddies-only") {
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
