/** First function to be called onload */
function onLoad() {
  navbarLoginDisplay();
  initializeMap();
}

/** Initializes map. */
function initializeMap() {
  mapCenter = { lat: 122.0841, lng: 37.4220 };
  var map = new google.maps.Map(document.getElementById('nearYouMap'), {
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
  // display loading icon with text.
  nearyouLoaderElement = document.getElementById('loader-icon-nearyou');
  findingNearbyEventsText = document.getElementById('finding-events-nearyou');
  foundNearbyEventsText = document.getElementById('found-events-nearyou');
  noNearbyEventsText = document.getElementById('no-events-nearyou');
  nearyouLoaderElement.style.display = 'block';
  findingNearbyEventsText.style.display = 'block';
  foundNearbyEventsText.style.display = 'none';
  noNearbyEventsText.style.display = 'none';

  fetch('/events')
  .then(response => response.json())
  .then(events => {
    var eventPromises = [];
    if (events.length == 0) {
      eventsDivElement.innerHTML = '<p>No nearby events to show.</p>';
      nearyouLoaderElement.style.display = 'none';
      findingNearbyEventsText.style.display = 'none';
      noNearbyEventsText.style.display = 'block';
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
        if (results == null) {
          nearyouLoaderElement.style.display = 'none';
          findingNearbyEventsText.style.display = 'none';
          noNearbyEventsText.style.display = 'block';
          eventsDivElement.innerHTML = '<p>No nearby events to show.</p>';
        }
        else {
          results.sort( compareDistanceToCurrLocation );
          for (var i = 0; i < results.length; i++) {
            eventsDivElement.appendChild(displayEvents(results[i].value));
          }
          // take away loading icon.
          nearyouLoaderElement.style.display = 'none';
          findingNearbyEventsText.style.display = 'none';
          foundNearbyEventsText.style.display = 'block';
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
        if (event.invitedAttendees.includes(userId) || 
        event.privacy == 'public') {
          eventObj = new Object();
          eventObj.event = event;
          eventObj.latLng = eventLatLng;
          resolveFn(eventObj);
          clearTimeout(timeout);
        }
      }
      else if (event.privacy == 'public') {
        eventObj = new Object();
        eventObj.event = event;
        eventObj.latLng = eventLatLng;
        resolveFn(eventObj);
        clearTimeout(timeout);
      } 
    }
    else {
      // Reject the promise.
      rejectFn();
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
    if (destinations.length == 0) {  resolveFn(null); } 
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
  let eventElement;
  if (localStorage.getItem(LOCAL_STORAGE_STATUS) === 'false') {
    eventElement = createEventNoResponse(eventObj.event);
  } else {
    const userID = localStorage.getItem(LOCAL_STORAGE_ID);
    eventElement = createEventWithResponse(eventObj.event, userID);
  }

  const eventDistance = document.createElement('p');
  eventDistance.className = 'distance-display';
  eventDistance.innerText = eventObj.distanceText;
  eventDistance.innerText += ' from your current location';
  eventElement.appendChild(eventDistance);
  return eventElement;
}
