// Global Variables
const API_KEY = 'AIzaSyBf5E9ymEYBv6mAi78mFBOn8oUVvO8sph4';
const CREATE_EVENT_PAGE = 'createEventPage';
const EXPLORE_MAP_PAGE = 'exploreMapPage';
const SESSION_STORE_LOCATION = 'locationName';
const SESSION_STORE_PLACEID = 'placeId';

/** Initial display of screen */
function initialDisplay() {
  navbarLoginDisplay(); // This function is located in profileScript.js
  initMap();
}

/** Initializes map and displays it. */
function initMap() {
  newCenterId = sessionStorage.getItem(SESSION_STORAGE_CURRENT_LOCATION);
  mapCenter = { lat: 37.4220, lng: -122.0841 };
  infoWindow = new google.maps.InfoWindow;
  var marker = new google.maps.Marker;
  var filterElements = document.getElementsByClassName('filter-button');
  
  var map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 14,
    mapTypeId: 'terrain',
    styles: [ 
      {elementType: 'labels.text.fill', stylers: [{color: '#002b54'}]},
      {
        featureType: 'road',
        elementType: 'labels.text',
        stylers: [{visibility: 'off'}]
      }
    ]
  });

  
  // Checks to see if location was clicked from users saved interests.
  if (newCenterId) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'placeId' : newCenterId}, function(results, status) {
      if (status == "OK") {
        mapCenter = results[0].geometry.location;
        map.setCenter(mapCenter);
        for (var i = 0; i < filterElements.length; i++) {
        // Intentionally outsourced to separate function to solve looping bugs.
        addEventToFilter(map, filterElements.item(i).id, mapCenter, filterElements.item(i));
        }
        function addEventToFilter (map, id, mapCenter, filterItem) {
          filterItem.addEventListener('click', () => {
            highlightNearbyLocation(map, id, mapCenter);
          });
        }
        fetchPlaceInformation(newCenterId, map, EXPLORE_MAP_PAGE);
        marker.setPosition(mapCenter);
        marker.setMap(map);

        // Remove session storage variable until saved interest is clicked from profile page again.
        sessionStorage.removeItem(SESSION_STORAGE_CURRENT_LOCATION);
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
      // For use on Nearme page
      localStorage.setItem('currentLocation', pos);
      for (var i = 0; i < filterElements.length; i++) {
        // Intentionally outsourced to separate function to solve looping bugs.
        addEventToFilter(map, filterElements.item(i).id, pos, filterElements.item(i));
      }
      function addEventToFilter (map, id, mapCenter, filterItem) {
        filterItem.addEventListener('click', () => {
          highlightNearbyLocation(map, id, mapCenter);
        });
      }
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
    infoWindow.close(map);
    fetchPlaceInformation(e.placeId, map, EXPLORE_MAP_PAGE);
    e.stop(); // Stops infobox from appearing when location clicked
    marker.setPosition(e.latLng);
    marker.setMap(map);
  });
  // For use on Nearme page
  localStorage.setItem('currentMap', map);
}

/** Handles any errors that have to do with geolocation. */
function handleLocationError(browserHasGeolocation, pos) {
  infoWindow.setContent(browserHasGeolocation ? 
    'Error: The Geolocation service failed.' :
    'Error: Your browser does not suppor geolocation.'
    );
  infoWindow.open(map);
}

/** Searches nearby for a type of location and places markers there. */
function highlightNearbyLocation(map, placeType, currentLocation) {
  var request = {
    location: currentLocation,
    radius: '1000',
    type: [placeType]
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
  // output response of API call to console
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(map, results[i].geometry.location);
      }
      function createMarker(thisMap, location) {
        var marker = new google.maps.Marker({
          position: location,
          map: thisMap
        })
      }
    }
    else {
      alert(status);
    }
  } 
}

/** Fetches information about a place. */
function fetchPlaceInformation(place_id, map, where) {
  var service = new google.maps.places.PlacesService(map);
  
  if (where == CREATE_EVENT_PAGE) {
    var request = { placeId: place_id, fields: ['name'] };
    service.getDetails(request, callback);

    function callback(place, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        // Updates sessionStorage and update input forms.
        sessionStorage.setItem(SESSION_STORE_LOCATION, place.name);
        sessionStorage.setItem(SESSION_STORE_PLACEID, place_id);
        getLocationInfo();
      }
    }
  } 
  else if (where == EXPLORE_MAP_PAGE) {
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

    service.getDetails(request, callback);

    function callback(place, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        sessionStorage.setItem(SESSION_STORE_LOCATION, place.name);
        sessionStorage.setItem(SESSION_STORE_PLACEID, place_id);
        sideBarElement = document.getElementById('side');
        infoDivElement = document.getElementById('place-info');
        userPostsDivElement = document.getElementById('UserPosts');
        eventsDivElement = document.getElementById('Events');
        infoDivElement.innerHTML = '';
        userPostsDivElement.innerHTML = '';
        eventsDivElement.innerHTML = '';
        
        nameElement = document.createElement('h2');
        ratingElement = document.createElement('span');
        ratingElement.id = 'stars';
        addressElement = document.createElement('p');
        createEventElement = document.createElement('a');
        interestButtonElement = document.createElement('button');
        deleteEventsButtonElement = document.createElement('button');
        
        nameElement.innerText = place.name;
        addressElement.innerText = 'Address: ' + place.formatted_address;
        // function to create tab and return tab div element
        tabDivElement = createTabElement();
        createEventElement.innerText = 'Create an Event';
        createEventElement.href = 'CreateAnEvent.html';
        interestButtonElement.addEventListener('click', () => {
          saveOrRemoveInterest(place.name, place_id, interestButtonElement);
        });
        deleteEventsButtonElement.addEventListener('click', () => {
          deleteAllEvents();
        })
        infoDivElement.appendChild(nameElement);

        if (place.website) {
          websiteElement = document.createElement('a');
          websiteElement.innerText = place.website;
          websiteElement.href = place.website;
          infoDivElement.appendChild(websiteElement);
        }

        infoDivElement.appendChild(addressElement);

        if (place.business_status) {
          businessStatusElement = document.createElement('p');
          businessStatusElement.innerText = 'Business Status: ' + place.business_status;
          infoDivElement.appendChild(businessStatusElement);
        }

        if (place.rating) {
          ratingElement.innerHTML = getStars(place.rating) +
           ' ' + place.rating + '<br></br>';
          infoDivElement.appendChild(ratingElement); 
        }
        
        infoDivElement.appendChild(deleteEventsButtonElement);
        if (localStorage.getItem(LOCAL_STORAGE_STATUS) === 'true') {
          let userId = localStorage.getItem(LOCAL_STORAGE_ID);
          setInterestButtonText(interestButtonElement, place_id, userId);
          infoDivElement.appendChild(interestButtonElement);
          eventsDivElement.appendChild(createEventElement);
          eventsDivElement.appendChild(getAvailableEvents(userId));  
          userPostsDivElement.appendChild(getUserPosts()); 
        }
        else {
          eventsDivElement.appendChild(getPublicEvents());
        }
        infoDivElement.appendChild(tabDivElement);
        infoDivElement.appendChild(eventsDivElement);
        infoDivElement.appendChild(userPostsDivElement);
        document.getElementById('open').click();
        sideBarElement.appendChild(infoDivElement);
        return sideBarElement;
      }
    }
  }
}

/** Creates tab element to display user posts and events in. */
function createTabElement() {
  tabDivElement = document.createElement('div');
  tabDivElement.id = 'tab';
  tabDivElement.className = 'tab';
  tabDivElement.innerHTML = '';
  postsButtonElement = document.createElement('button');
  eventsButtonElement = document.createElement('button');
  postsButtonElement.innerText = 'Posts';
  postsButtonElement.className = 'tablinks active';
  postsButtonElement.id = 'open';
  eventsButtonElement.innerText = 'Events'
  eventsButtonElement.className = 'tablinks';
  tabDivElement.appendChild(postsButtonElement);
  tabDivElement.appendChild(eventsButtonElement);
  postsButtonElement.addEventListener('click', function(e) {
          openTab(e, 'UserPosts');
        });
  eventsButtonElement.addEventListener('click', function(e) {
          openTab(e, 'Events');
        });
  return tabDivElement;
}

/** Opens a specific tab (Posts/Events) when tab is clicked. */
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName('tabcontent');
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
  }
  tablinks = document.getElementsByClassName('tablinks');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
    tablinks[i].id = tablinks[i].id.replace('open', '');
  }
  document.getElementById(tabName).style.display = 'block';
  evt.currentTarget.className += ' active';
  evt.currentTarget.id += 'open';
}

/** Converts place rating to stars. */
function getStars(rating) {
  // Round to the nearest half.
  rating = Math.round(rating *2) / 2;
  let output = [];
  
  // Append all the filled whole stars
  for (var i = rating; i >= 1; i--) {
    output.push(
      '<i class="fa fa-star" aria-hidden="true" style="color: gold;"></i>&nbsp;'
      );
  }

  // Appending half a star if it exists.
  if (i == .5) {
    output.push(
      '<i class="fa fa-star-half-o" aria-hidden="true" style="color: gold;"></i>&nbsp;'
      );
  }

  //Fill the empty stars.
  for (let i = (5 - rating); i >= 1; i--) {
    output.push(
      '<i class="fa fa-star-o aria-hidden="true" style="color: gold;"></i>&nbsp;'
    );
  }
  return output.join('');
}
/** Makes place_id and location name of a place available. */
function getLocationInfo() {
  locationInputElement = document.getElementById('location');
  placeIdInputElement = document.getElementById('place-id');
  locationName = sessionStorage.getItem(SESSION_STORE_LOCATION);
  placeId = sessionStorage.getItem(SESSION_STORE_PLACEID);
  locationInputElement.value = locationName;
  placeIdInputElement.value = placeId;
}

/** Makes map snippet for create event page. */
function createMapSnippet() {
  var geocoder = new google.maps.Geocoder();
  var locationName = sessionStorage.getItem(SESSION_STORE_LOCATION)
  var placeId = sessionStorage.getItem(SESSION_STORE_PLACEID);
  var infoWindow = new google.maps.InfoWindow;
  var marker = new google.maps.Marker;

  var mapSnippet = new google.maps.Map(document.getElementById('map-snippet'), {
    zoom: 16 
  });

  // Using geocode API to transform placeId into LngLat.
  geocoder.geocode( {'placeId' : placeId}, function(results, status) {
    if (status == "OK") {
      mapSnippetCenter = results[0].geometry.location;
      mapSnippet.setCenter(mapSnippetCenter);
      infoWindow.setPosition(mapSnippetCenter);
      infoWindow.setContent('Creating an event at ' + locationName);
      infoWindow.open(mapSnippet);
    }
    else {
      alert('Geocode was not successful for the following reason: ' + status);
      mapSnippet.setCenter( { lat: 122.0841, lng: 37.422 })
    }
  })
  mapSnippet.addListener('click', function(e) {
    fetchPlaceInformation(e.placeId, mapSnippet, CREATE_EVENT_PAGE);
    e.stop(); // Stops infobox from showing when location clicked.
    infoWindow.close(mapSnippet);
    marker.setPosition(e.latLng);
    marker.setMap(mapSnippet);
  });
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
  Get all public events to display on map page even when user isn't logged in.
 */
function getPublicEvents() {
  eventDivElement = document.createElement("div");
  eventDivElement.innerText = '';
  locationName = sessionStorage.getItem(SESSION_STORE_LOCATION);

  fetch("events")
    .then(response => response.json())
    .then(events => {
      for (i = 0; i < events.length; i++) {
        if (events[i].location == locationName 
            && events[i].privacy == "public") {
            eventDivElement.appendChild(createEventNoResponse(events[i]));
          }
        }
    });
  return eventDivElement;
}

/**
  Gets events the user is allowed to see.
*/
function getAvailableEvents(userID) {
  eventDivElement = document.createElement("div");
  eventDivElement.innerText = '';
  locationName = sessionStorage.getItem(SESSION_STORE_LOCATION);

  fetch("events")
    .then(response => response.json())
    .then(events => {
      for (i = 0; i < events.length; i++) {
        if (events[i].location == locationName) {
          invitedAttendees = events[i].invitedAttendees;
          rsvpAttendees = events[i].rsvpAttendees;
          rsvpContains = rsvpAttendees.includes(userID);
          if (events[i].privacy == "public") {
            // display public events even if user is not attending
            if (!rsvpContains) {
              eventDivElement.appendChild(createEventWithResponse(events[i], userID, "false"));
            }
          }
          if (rsvpContains) {
            // display events the user is attending
            eventDivElement.appendChild(createEventWithResponse(events[i], userID, "true"));
          }
          else if (invitedAttendees.includes(userID)) {
            // display events the user is invited to
            eventDivElement.appendChild(createEventWithResponse(events[i], userID, "false"));
          }
        }
      }
    });
  return eventDivElement;
}

function createEventNoResponse(event) {
  const eventElement = document.createElement('div');
  eventElement.className = "card";

  const eventContents = document.createElement('div');
  eventContents.className = "contents";

  const eventName = document.createElement('h2');
  eventName.className = "name-display";
  eventName.innerText = event.eventName;

  const eventDate = document.createElement('p');
  eventDate.className = "date-display";
  eventDate.innerText = event.dateTime;

  const locationDisplay = document.createElement('div');
  locationDisplay.className = "location-display";
  const locationIcon = document.createElement('i');
  locationIcon.className = 'fa fa-map-marker';
  const eventLocation = document.createElement('p');
  eventLocation.className = "location-name";
  eventLocation.innerText = event.location;
  locationDisplay.append(locationIcon);
  locationDisplay.append(eventLocation);
  if (window.location.pathname === '/profile.html') {
    locationDisplay.addEventListener('click', () => {
      sessionStorage.setItem(SESSION_STORAGE_CURRENT_LOCATION, event.placeId);
      window.location.href = 'map.html';
    });
  }

  const eventDetails = document.createElement('p'); 
  eventDetails.className = "details-display";
  eventDetails.innerText = event.eventDetails;

  eventElement.append(eventContents);
  eventElement.append(eventName);
  eventElement.append(eventDate);
  eventElement.append(locationDisplay);
  eventElement.append(eventDetails);
  return eventElement;
}

function createEventWithResponse(event, userID, going) {
  const eventElement = createEventNoResponse(event);

  const bottomCard = document.createElement('div');
  bottomCard.id = "bottom-event-wrapper";

  if (userID === event.creator) {
    const deleteButton = document.createElement('button');
    deleteButton.className = "icon-button";
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa fa-trash-o';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', () => {
      deleteSingleEvent(event, eventElement);
    });

    bottomCard.append(deleteButton);
  }
  
  const rsvpButton = document.createElement('button');
  setRSVPText(rsvpButton, going);

  rsvpButton.addEventListener('click', () => {
    addRemoveAttendee(event, rsvpButton);
  }); 

  bottomCard.append(rsvpButton);
  eventElement.append(bottomCard);
  return eventElement;
}

function setRSVPText(rsvpButton, going) {
  if (going === "true") {
    rsvpButton.innerText = "Not Going";
  }
  else {
    rsvpButton.innerText = "Going";
  }
}

function addRemoveAttendee(event, rsvpButton) {
  const params = new URLSearchParams();
  params.append('eventId', event.eventId);
  fetch('/add-remove-attendee', {
    method: 'POST', body: params
  }).then(switchRSVPButtonText(rsvpButton));
}

function deleteSingleEvent(event, eventElement) {
  const params = new URLSearchParams();
  params.append('id', event.eventId);
  fetch('/delete-single-event', {
    method: 'POST', body: params
  }).then(eventElement.style.display = "none");
}

function switchRSVPButtonText(rsvpButton) {
  if (rsvpButton.innerText === "Going") {
    rsvpButton.innerText = "Not Going";
  }
  else {
    rsvpButton.innerText = "Going";
  }
  if (window.location.pathname === '/profile.html') {
    profileOnload();
  }
}

/** Sends post request to store or remove saved interest. */
function saveOrRemoveInterest(locationName, placeId, interestButtonElement) {
  const params = new URLSearchParams()
  params.append('place-id', placeId);
  params.append('location-name', locationName);
  fetch('/interest', {
    method: 'POST', body: params
  }).then(switchInterestButtonText(interestButtonElement));
}

/** Switches the text of the interest button. */
function switchInterestButtonText(interestButtonElement) {
  if (interestButtonElement.innerText === 'Remove as interest') {
    interestButtonElement.innerText = 'Save as interest';
  } else {
    interestButtonElement.innerText = 'Remove as interest';
  }
}

/** Sets interest button's text based on whether it has already been saved by the user. */
function setInterestButtonText(interestButtonElement, placeId, userId) {
  alreadySaved = false;
  fetch('/interest').then(response => response.json()).then((interests) => {
    for (let i = 0; i < interests.length; i ++) {
      if (interests[i].placeId === placeId && 
          interests[i].interestedUsers.includes(userId)) {
        alreadySaved = true;
        interestButtonElement.innerText = 'Remove as interest';
      }
    }
    if (!alreadySaved) {
      interestButtonElement.innerText = 'Save as interest';
    }
  });
}

function deleteAllEvents() {
  const request = new Request('/delete-events', {method: 'POST'});
    fetch(request);
}
