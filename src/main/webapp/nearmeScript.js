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
    var eventPromises = [];
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
          var currentEventPromise = new Promise((resolveFn, rejectFn) => {
            console.log('is nearby called');
            console.log(currentEventPromise);
            isNearby(geocoder, currentEvent, locationCircle, userId, resolveFn, rejectFn);
          });
          eventPromises.push(currentEventPromise);
        } 
      }
    }
    // When user is not logged in, get only public events.
    else {
      for (var i = 0; i < events.length; i++) {
        if (events[i].currency === "current") {
          var currentEvent = events[i];
          var currentEventPromise = eventPromises[i];
          // isNearby(geocoder, currentEvent, locationCircle, '', currentEventPromise);
        }
      }
    }
    // check to see if list is done being made here
    Promise.all(eventPromises).then((listOfEventObjects) => {
      calculateDistances(currentLocation, listOfEventObjects).then((results) => {
        console.log(results);
      });
    });
    
    // sort the list with comparison function
    // call function to display events with the sorted list
  });
}

/** Checks to see if an event is nearby */
function isNearby(geocoder, event, locationCircle, userId, resolveFn, rejectFn) {
  geocoder.geocode( {'placeId' : event.placeId}, function(results, status) {
    if (status !== google.maps.GeocoderStatus.OK) {
      alert('Geocode was not successful for the following reason: ' + status);
      // reject the promise
      rejectFn();
      return;
    }
    // resolve the promise
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
          resolveFn(eventObj);

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
  return new Promise(function(resolveFn, reject) {
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
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: destinations,
        travelMode: 'WALKING'
      }, callback
    );
    // get results
    function callback(response, status) {
      if (status == 'OK') {
        distances = response.rows[0].elements;
        for (var i = 0; i < listOfEventObjects.length; i ++) {
          listOfEventObjects[i].distanceText = distances[i].distance.text;
          listOfEventObjects[i].distanceValue = distances[i].distance.value; 
        }
        resolveFn(listOfEventObjects);
      }
      else { 
        console.log(status);
        reject(); 
      }
    }
  });
}
