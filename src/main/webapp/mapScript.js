
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.937, lng: 150.644 },
    zoom: 14
  })

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
      }, function() {
        handleLocationError(true, map.getCenter());
      });
  } else {
    // Browser does not support Geolocation
    handleLocationError(false, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, pos) {
  infoWindow.setContent(browserHasGeolocation ? 
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser does not suppor geolocation.');
  infoWindow.open(map);
}