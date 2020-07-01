// Global Variables
const API_KEY = 'AIzaSyBf5E9ymEYBv6mAi78mFBOn8oUVvO8sph4';

/** Initial display of screen */
function initialDisplay() {
  initMap();
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
    console.log(result.result);
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
    nameElement.innerText = 'Name: ' + result.result.name;
    ratingElement.innerText = 'Rating: ' + result.result.rating;
    addressElement.innerText = 'Address: ' + result.result.formatted_address;
    websiteElement.innerText = result.result.website;
    websiteElement.href = result.result.website;
    createEventElement.innerText = 'Create an Event';
    createEventElement.href = 'CreateAnEvent.html';
    businessStatusElement.innerText = 'Business Status: ' + result.result.business_status;
    infoDivElement.appendChild(nameElement);
    infoDivElement.appendChild(ratingElement);
    infoDivElement.appendChild(addressElement);
    infoDivElement.appendChild(websiteElement);
    infoDivElement.appendChild(businessStatusElement);
    infoDivElement.appendChild(getUserPosts());
    infoDivElement.appendChild(createEventElement);
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

/*
 * Displays login options in the navbar based on the user's login status.
 */
function navbarLoginDisplay() {
  // Clear the login-specific elements previously displayed.
  const userNavbarSection = document.getElementById('user-navbar-section');
  userNavbarSection.innerHTML = '';

  fetch('/login').then(response => response.json()).then((json) => {
  
    // If the user is logged in, confirm the user has a name, then 
    // add logout and profile buttons to the navbar.
    if (json['loginStatus'].localeCompare('true') == 0) {
      const logoutButton = document.createElement('button');
      logoutButton.innerText = 'Logout';
      logoutButton.addEventListener('click', () => {
        window.location.href = json['logoutUrl'];
      });
      const personalProfileButton = document.createElement('button');
      personalProfileButton.innerText = 'My Profile';
      personalProfileButton.addEventListener('click', () => {
        visitProfile(json['id']);
      });
      userNavbarSection.appendChild(logoutButton);
      userNavbarSection.appendChild(personalProfileButton);
    
    // If the user is logged in, add a login button to the navbar.
    } else {
      const loginButton = document.createElement('button');
      loginButton.innerText = 'Login';
      loginButton.addEventListener('click', () => {
        window.location.href = json['loginUrl'];
      });
      userNavbarSection.appendChild(loginButton);
    }
  });
}
