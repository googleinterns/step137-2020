/** First function to be called onload */
function onLoad() {
  navbarLoginDisplay();
  initializeMap();
}

/** Initializes map. */
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
          var currentEventPromise = isNearby(geocoder, currentEvent, locationCircle, userId);
          eventPromises.push(currentEventPromise);
        } 
      }
    }
    
    // When user is not logged in, get only public events.
    else {
      for (var i = 0; i < events.length; i++) {
        if (events[i].currency === "current") {
          var currentEvent = events[i];
          var currentEventPromise = isNearby(geocoder, currentEvent, locationCircle, '');
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
    Promise.allSettled(eventPromises).then((listOfEventObjects) => {
      calculateDistances(currentLocation, listOfEventObjects).then((results) => {
        results.sort( compareDistanceToCurrLocation );
        for (var i = 0; i < results.length; i++) {
          eventsDivElement.appendChild(displayEvents(results[i].value));
        }
      });
    });
  });
}

/** Checks to see if an event is nearby */
function isNearby(geocoder, event, locationCircle, userId) {
  return new Promise(function(resolveFn, rejectFn) {
    const timeout = setTimeout(() => rejectFn(), 1000);
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
          clearTimeout(timeout);
        }
      }
      else {
        if (event.privacy == 'public'){
          eventObj = new Object();
          eventObj.event = event;
          eventObj.latLng = eventLatLng;
          resolveFn(eventObj);
          clearTimeout(timeout);
        }
      } 
      
    }
  });
  });  
}

/** Calculates distances between all event locations and the current location. */
function calculateDistances(currentLocation, listOfEventObjects) {
  return new Promise(function(resolveFn, reject) {
    results = [];
    origin = currentLocation;
    destinations = [];
    for (var i = 0; i < listOfEventObjects.length; i++) {
      // Checks to see if the promise was resolved.
      // Resolved promises have values.
      if (listOfEventObjects[i].value) { 
        destinations.push(listOfEventObjects[i].value.latLng);
      }
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
        var distanceIndex = 0;
        for (var i = 0; i < listOfEventObjects.length; i ++) {
          // Checks to see if the promise was resolved.
          // Resolved promises have values.
          if (listOfEventObjects[i].value) {
            listOfEventObjects[i].value.distanceText = distances[distanceIndex].distance.text;
            listOfEventObjects[i].value.distanceValue = distances[distanceIndex].distance.value;
            distanceIndex++;
            results.push(listOfEventObjects[i]);
          }
        }
        resolveFn(results);
      }
      else { 
        reject(); 
      }
    }
  });
}

/** Compares events by their distance to the current location */
function compareDistanceToCurrLocation(eventObj1, eventObj2) {
  if (eventObj1.value.distanceValue < eventObj2.value.distanceValue) {
    return -1;
  }
  if (eventObj1.value.distanceValue > eventObj2.value.distanceValue) {
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
