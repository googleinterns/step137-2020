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
    createEventElement = document.createElement('a');
    businessStatusElement = document.createElement('p');
    saveInterestButtonElement = document.createElement('button');    
    nameElement.innerText = 'Name: ' + result.result.name;
    ratingElement.innerText = 'Rating: ' + result.result.rating;
    addressElement.innerText = 'Address: ' + result.result.formatted_address;
    websiteElement.innerText = result.result.website;
    websiteElement.href = result.result.website;
    createEventElement.innerText = 'Create an Event';
    createEventElement.href = 'CreateAnEvent.html';
    saveInterestButtonElement.innerText = 'Interested';
    saveInterestButtonElement.addEventListener('click', () => {
      saveInterest(result.result.name, place_id);
    });
    businessStatusElement.innerText = 'Business Status: ' + result.result.business_status;
    infoDivElement.appendChild(nameElement);
    infoDivElement.appendChild(ratingElement);
    infoDivElement.appendChild(addressElement);
    infoDivElement.appendChild(websiteElement);
    infoDivElement.appendChild(businessStatusElement);
    userIsLoggedIn().then( loginStatus => {
      if (loginStatus) {
        getEvents();
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

/** Gets events at a location */
function getEvents() {
  fetch('/events')
  .then(response => response.json())
  .then(json => {
    console.log(json[0])
  });
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
  const params = new URLSearchParams();
  params.append('name', locationName);
  params.append('placeId', placeId);
  fetch('/saveInterest', {
    method: 'POST', body: params
  });
}
