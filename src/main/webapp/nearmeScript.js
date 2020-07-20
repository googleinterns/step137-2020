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
          isNearby(geocoder, currentEvent, locationCircle, userId);
        }
      }
    }
    // When user is not logged in, get only public events.
    else {
      for (var i = 0; i < events.length; i++) {
        if (events[i].currency === "current") {
          var currentEvent = events[i];
          isNearby(geocoder, currentEvent, locationCircle, '');
        }
      }
    }
  });
}

/** Checks to see if an event is nearby */
function isNearby(geocoder, event, locationCircle, userId) {
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
