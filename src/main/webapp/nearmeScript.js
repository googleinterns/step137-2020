/** Initializes map and displays it. */
function initializeMap() {
  mapCenter = { lat: 122.0841, lng: 37.4220 };
  var map = new google.maps.Map(document.getElementById('nearMeMap'), {
    center: mapCenter,
    zoom: 14, 
  });
  // Checks if browser supports geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);

      var service = new google.maps.places.PlacesService(map);
      
      }, function() {
        handleLocationError(true, map.getCenter());
      });
  } else {
    // Browser does not support Geolocation.
    handleLocationError(false, map.getCenter());
  }
}

/** Searches for events nearby */
function findNearbyEvents(map, currentLocation) {
  var request = {
    location: currentLocation,
    radius: '500',
    type: ['restaurant']
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
  // output response of API call to console
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      console.log(results);
    }
    else {
      alert(status);
    }
  }
  // link this function to nearme page
  // test
}
