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
          var currentEventPromise = new Promise((resolveFn, rejectFn) => {
            isNearby(geocoder, currentEvent, locationCircle, '', resolveFn, rejectFn);
          });
          eventPromises.push(currentEventPromise);
        }
      }
    }

    // Get list of nearby event objects after isNearby is finished running.
    /** Nearby event object structure:
        {
          type: json, 
          properties:[ event,
                    eventLatLng,
                    distanceText,
                    distanceValue
                   ]
        }
    */  
    Promise.all(eventPromises).then((listOfEventObjects) => {
      calculateDistances(currentLocation, listOfEventObjects).then((results) => {
        results.sort( compareDistanceToCurrLocation );
        for (var i = 0; i < listOfEventObjects.length; i++) {
          eventsDivElement.appendChild(displayEvents(listOfEventObjects[i]));
        }
      });
    });
  });
}

/** Checks to see if an event is nearby */
function isNearby(geocoder, event, locationCircle, userId, resolveFn, rejectFn) {
  geocoder.geocode( {'placeId' : event.placeId}, function(results, status) {
    if (status !== google.maps.GeocoderStatus.OK) {
      alert('Geocode was not successful for the following reason: ' + status);
      // Reject the promise.
      rejectFn();
      return;
    }
    // Resolve the promise.
    eventLatLng = results[0].geometry.location;
    var isNearby = locationCircle.getBounds().contains(eventLatLng)
    if (isNearby) {
      if (userId) {
        if (event.rsvpAttendees.includes(userId) ||
        event.invitedAttendees.includes(userId) || 
        event.privacy == 'public') {
          eventObj = new Object();
          eventObj.event = event;
          eventObj.latLng = eventLatLng;
          resolveFn(eventObj);
        }
      }
      else {
        if (event.privacy == 'public'){
          eventObj = new Object();
          eventObj.event = event;
          eventObj.latLng = eventLatLng;
          resolveFn(eventObj);
        }
      } 
      
    }
  });
}

/** Calculates distances between all event locations and the current location. */
function calculateDistances(currentLocation, listOfEventObjects) {
  return new Promise(function(resolveFn, reject) {
    origin = currentLocation;
    destinations = [];
    for (var i = 0; i < listOfEventObjects.length; i++) {
      destinations.push(listOfEventObjects[i].latLng);
    } 
    
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: destinations,
        travelMode: 'WALKING'
      }, callback
    );
    
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
        reject(); 
      }
    }
  });
}

/** Compares events by their distance to the current location */
function compareDistanceToCurrLocation(eventObj1, eventObj2) {
  if (eventObj1.distanceValue < eventObj2.distanceValue) {
    return -1;
  }
  if (eventObj1.distanceValue > eventObj2.distanceValue) {
    return 1;
  }
  return 0;
}

/** Displays events with an indication of how far they are from the current location. */
function displayEvents(eventObj) {
  const eventElement = document.createElement('div');
  eventElement.className = "card";
  eventElement.addEventListener('click', () => {
    sessionStorage.setItem('currentLocationId', eventObj.event.placeId);
    window.location.href = 'map.html';
  });

  const eventContents = document.createElement('div');
  eventContents.className = "contents";

  const eventName = document.createElement('h2');
  eventName.className = "name-display";
  eventName.innerText = eventObj.event.eventName;

  const eventDate = document.createElement('p');
  eventDate.className = "date-display";
  eventDate.innerText = eventObj.event.dateTime;

  const locationDisplay = document.createElement('div');
  locationDisplay.className = "location-display";
  const locationIcon = document.createElement('i');
  locationIcon.className = 'fa fa-map-marker';
  const eventLocation = document.createElement('p');
  eventLocation.className = "location-name";
  eventLocation.innerText = eventObj.event.location;
  locationDisplay.append(locationIcon);
  locationDisplay.append(eventLocation);

  const eventDetails = document.createElement('p'); 
  eventDetails.className = "details-display";
  eventDetails.innerText = eventObj.event.eventDetails;

  const eventDistance = document.createElement('p');
  eventDistance.className = 'distance-display';
  eventDistance.innerText = eventObj.distanceText;
  eventDistance.innerText += ' from your current location';

  eventElement.append(eventContents);
  eventElement.append(eventName);
  eventElement.append(eventDate);
  eventElement.append(locationDisplay);
  eventElement.append(eventDistance);
  eventElement.append(eventDetails);
  return eventElement;
}
