// Global Variables
API_KEY = 'AIzaSyBf5E9ymEYBv6mAi78mFBOn8oUVvO8sph4';

/** Initializes map and displays it. */
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.937, lng: 150.644 },
    zoom: 14
  })

  // Checks if browser supports geolocation
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
    // Browser does not support Geolocation
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

/** Fetches information about a place */
function fetchPlaceInformation( place_id ) {
  // Not sure if I am allowed to use a heroku proxy for this request.
  // Without the proxy, the data returned by the request is blocked.
  // With the proxy, it seems to work fine 
  // TODO: ask VSE about this when they become available.
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  var fetchUrl = 'https://maps.googleapis.com/maps/';
  fetchUrl += 'api/place/details/json?place_id='+ place_id;
  fetchUrl += '&fields=name';
  fetchUrl += '&key='+API_KEY;
  fetch(proxyUrl + fetchUrl)
  .then(response => response.json())
  .then(result => { 
    console.log(result.result.name);
    sideBarElement = document.getElementById('side');
    infoDivElement = document.createElement('div');
    nameElement = document.createElement('p');
    nameElement.innerText = result.result.name;
    infoDivElement.appendChild(nameElement);
    return infoDivElement;
    })
}
