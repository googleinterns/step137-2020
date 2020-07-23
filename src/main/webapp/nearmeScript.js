// Global variables
// var listOfEventObjs = [];

/** First function to be called onload */
function onLoad() {
  navbarLoginDisplay();
  initializeMap();
}

/** Initializes map and displays it. */
function initializeMap() {
  mapCenter = { lat: 122.0841, lng: 37.4220 };
  var map = new google.maps.Map(document.getElementById('nearMeMap'), {
    center: mapCenter,
    zoom: 16, 
  });
  // Checks if browser supports geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
      findNearbyEvents(map, pos);      
      }, function() {
        handleLocationError(true, map.getCenter());
      });
  } else {
    // Browser does not support Geolocation.
    handleLocationError(false, map.getCenter());
  }
}

/** Displays events nearby */
function findNearbyEvents(map, currentLocation) {
  eventsDivElement = document.getElementById('nearbyEvents');
  eventsDivElement.innerHTML = '';
  var geocoder = new google.maps.Geocoder();
  // This is the circle within which we search for events.
  var locationCircle = new google.maps.Circle({ 
    map: map,
    center: currentLocation,
    radius: 2000 
  });
  
  fetch('/events')
  .then(response => response.json())
  .then(events => {
    var listOfEventObjs = []
    if (events.length == 0) {
      eventsDivElement.innerHTML = '<p>No nearby events to show.</p>';
      return;
    }
    // When user is logged in, get all public events and events user is attending.
    if (localStorage.getItem('loginStatus').localeCompare('true') == 0) {
      var userId = localStorage.getItem('userId');
      for (var i = 0; i < events.length; i++) {
        if (events[i].currency === "current") {
          var currentEvent = events[i];
          console.log('is nearby called');
          isNearby(geocoder, currentEvent, locationCircle, userId, listOfEventObjs);
        } 
      }
    }
    // When user is not logged in, get only public events.
    else {
      for (var i = 0; i < events.length; i++) {
        if (events[i].currency === "current") {
          var currentEvent = events[i];
          isNearby(geocoder, currentEvent, locationCircle, '', listOfEventObjs);
        }
      }
    }
    // check to see if list is done being made here
    // console.log(listOfEventObjs[0]); //not working! Fix tomorrow! Cannot access individual elements
    // call function to check for distances 
    // if so, sort the list with comparison function
    // call function to display events with the sorted list
  });
}

/** Checks to see if an event is nearby */
function isNearby(geocoder, event, locationCircle, userId, listOfEvtObjs) {
  geocoder.geocode( {'placeId' : event.placeId}, function(results, status) {
    if (status !== google.maps.GeocoderStatus.OK) {
      alert('Geocode was not successful for the following reason: ' + status);
      return;
    }
    eventLatLng = results[0].geometry.location;
    var isNearby = locationCircle.getBounds().contains(eventLatLng)
    if (isNearby) {
      if (userId) {
        if (event.rsvpAttendees.includes(userId) ||
        event.invitedAttendees.includes(userId) || 
        event.privacy == 'public') {
          // create object with event and add to working list of objects. The list will be a global variable
          eventObj = new Object();
          eventObj.event = event;
          eventObj.latLng = eventLatLng;
          listOfEvtObjs.push("here");

          eventElement = createEventNoResponse(event);
          eventElement.addEventListener('click', () => {
            sessionStorage.setItem('currentLocationId', event.placeId);
            window.location.href = 'map.html';
          });
           eventsDivElement.appendChild(eventElement);
        }
      }
      else {
        if (event.privacy == 'public'){
          eventElement = createEventNoResponse(event);
          eventElement.addEventListener('click', () => {
            sessionStorage.setItem('currentLocationId', event.placeId);
            window.location.href = 'map.html';
          });
          eventsDivElement.appendChild(eventElement);
        }
      } 
      
    }
  });
}

/** Calculates distances between all event locations and the current location. */
function calculateDistances(currentLocation, listOfEventObjects) {
  // get currentLocation latLng
  origin = currentLocation;
  destinations = [];
  // make list of latLngs of destinations
  for (var i = 0; i < listOfEventObjects.length; i++) {
    destinations.push(listOfEventObjects[i].latLng);
  }
  console.log(listOfEventObjects);
  console.log(destinations);
  
  // create service and make API call
  // get results
}

