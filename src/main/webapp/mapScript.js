// Global Variables
const API_KEY = 'AIzaSyBf5E9ymEYBv6mAi78mFBOn8oUVvO8sph4';
const CREATE_EVENT_PAGE = 'createEventPage';
const EXPLORE_MAP_PAGE = 'exploreMapPage';
const SESSION_STORE_LOCATION = 'locationName';
const SESSION_STORE_PLACEID = "placeId";

/** Initial display of screen */
function initialDisplay() {
  navbarLoginDisplay(); // This function is located in profileScript.js
  initMap();
}

/** Initializes map and displays it. */
function initMap() {
  newCenterId = sessionStorage.getItem('currentLocationId');
  mapCenter = { lat: -34.937, lng: 150.644 };
  infoWindow = new google.maps.InfoWindow;
  var marker = new google.maps.Marker;
  
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
        map.setCenter(mapCenter);
        fetchPlaceInformation(newCenterId, map, EXPLORE_MAP_PAGE);
        marker.setPosition(mapCenter);
        marker.setMap(map);

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
    infoWindow.close(map);
    fetchPlaceInformation(e.placeId, map, EXPLORE_MAP_PAGE);
    e.stop(); // Stops infobox from appearing when location clicked
    marker.setPosition(e.latLng);
    marker.setMap(map);
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
        ratingElement = document.createElement('p');
        addressElement = document.createElement('p');
        websiteElement = document.createElement('a');
        createEventElement = document.createElement('a');
        businessStatusElement = document.createElement('p');
        interestButtonElement = document.createElement('button');
        deleteEventsButtonElement = document.createElement('button');
        
        nameElement.innerText = place.name;
        ratingElement.innerText = 'Rating: ' + place.rating;
        addressElement.innerText = 'Address: ' + place.formatted_address;
        if (place.website) {
          websiteElement.innerText = place.website;
          websiteElement.href = place.website;
        }
        else {
          websiteElement.innerText = ' ';
        }
        // function to create tab and return tab div element
        tabDivElement = createTabElement();
        createEventElement.innerText = 'Create an Event';
        createEventElement.href = 'CreateAnEvent.html';
        businessStatusElement.innerText = 'Business Status: ' + place.business_status;
        interestButtonElement.addEventListener('click', () => {
          saveOrRemoveInterest(place.name, place_id, interestButtonElement);
        });
        deleteEventsButtonElement.addEventListener('click', () => {
          deleteAllEvents();
        })

        infoDivElement.appendChild(nameElement);
        infoDivElement.appendChild(websiteElement);
        infoDivElement.appendChild(addressElement);
        infoDivElement.appendChild(businessStatusElement);
        infoDivElement.appendChild(ratingElement); 
        infoDivElement.appendChild(deleteEventsButtonElement);
        if (localStorage.getItem('loginStatus').localeCompare('true') == 0) {
          let userId = localStorage.getItem('userId');
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
        sideBarElement.innerHTML = '<h1>Information Bar</h1>'
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
      mapSnippet.setCenter( { lat: -34.937, lng: 150.644})
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
            eventDivElement.appendChild(createEventPublic(events[i]));
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
          rsvpAttendees = events[i].rsvpAttendees;
          if (rsvpAttendees.includes(userID)) {
            eventDivElement.appendChild(createEventAttendees(events[i], userID, "true"));
          }
          else {
            eventDivElement.appendChild(createEventAttendees(events[i], userID, "false"));
          }
        }
      }
    });
  return eventDivElement;
}

function createEventPublic(event) {
  const eventName = document.createElement('h2');
  eventName.id = "name-display";
  eventName.innerText = event.eventName;

  const eventDate = document.createElement('p');
  eventDate.id = "date-display";
  eventDate.innerText = event.dateTime;

  const eventLocation = document.createElement('p');
  eventName.id = "location-display";
  eventLocation.innerText = event.location;

  const eventDetails = document.createElement('p'); 
  eventDetails.id = "details-display";
  eventDetails.innerText = event.eventDetails;

  const eventElement = document.createElement('div');
  eventElement.className = "card";
  const eventContents = document.createElement('div');
  eventContents.className = "contents";
  eventElement.append(eventContents);
  eventElement.append(eventName);
  eventElement.append(eventDate);
  eventElement.append(eventLocation);
  eventElement.append(eventDetails);
  return eventElement;
}

function createEventAttendees(event, userID, going) {
  const eventElement = document.createElement('div');
  eventElement.className = "card";

  const eventContents = document.createElement('div');
  eventContents.className = "contents";

  const eventName = document.createElement('h1');
  eventName.className = "name-display";
  eventName.innerText = event.eventName;

  const eventDate = document.createElement('p');
  eventDate.className = "date-display";
  eventDate.innerText = event.dateTime;

  const eventLocation = document.createElement('p');
  eventName.className = "location-display";
  eventLocation.innerText = event.location;

  const eventDetails = document.createElement('p'); 
  eventDetails.className = "details-display";
  eventDetails.innerText = event.eventDetails;

  const bottomCard = document.createElement('div');
  bottomCard.id = "bottom-event-wrapper";

  const deleteButton = document.createElement('button');
  deleteButton.className = "icon-button";
  const deleteIcon = document.createElement('i');
  deleteIcon.className = 'fa fa-trash-o';
  deleteButton.appendChild(deleteIcon);
  deleteButton.addEventListener('click', () => {
    deleteSingleEvent(event, eventElement);
  });
  
  const rsvpButton = document.createElement('button');
  if (going === "true") {
    rsvpButton.innerText = "Not Going";
  }
  else if (going === "false") {
    rsvpButton.innerText = "Going";
  }

  rsvpButton.addEventListener('click', () => {
    addRemoveAttendee(event, userID, rsvpButton);
  }); 

  bottomCard.append(rsvpButton);
  bottomCard.append(deleteButton);

  eventElement.append(eventContents);
  eventElement.append(eventName);
  eventElement.append(eventDate);
  eventElement.append(eventLocation);
  eventElement.append(eventDetails);
  eventElement.append(bottomCard);
  return eventElement;
}

function addRemoveAttendee(event, userID, rsvpButton) {
  const params = new URLSearchParams();
  params.append('userID', userID);
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
}

/** Checks to see if a user is logged in. */
function userIsLoggedIn() {
   return fetch('/login')
  .then(response => response.json())
  .then(json => { 
    return [ json['loginStatus'], json['id'] ] 
  });
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
  if (interestButtonElement.innerText.localeCompare('Remove as interest') == 0) {
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
      if (interests[i].placeId.localeCompare(placeId) == 0 && 
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
