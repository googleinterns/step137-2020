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
  var geocoder = new google.maps.Geocoder();
  // This is the circle within which we search for events.
  var locationCircle = new google.maps.Circle({ 
    map: map,
    center: currentLocation,
    radius: 500 
  });
  
  fetch('/events')
  .then(response => response.json())
  .then(events => {
    for (i = 0; i < events.length; i++) {
      geocoder.geocode( {'placeId' : events[i].placeId}, function(results, status) {
        if (status == "OK") {
          eventLatLng = results[0].geometry.location;
          var isNearby = locationCircle.getBounds().contains(eventLatLng)
          if (isNearby) {
            eventsDivElement.appendChild(createEvent(events[i]));
          }
          // ? console.log('Yes')
          // : console.log('No')
        }
        else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  });
}

// TODO: Decide if this will be useful for map page (filtering locations)
 /** Searches for events nearby */
// function findNearbyEvents(map, currentLocation) {
//   var request = {
//     location: currentLocation,
//     radius: '500',
//     type: ['restaurant']
//   };
//   service = new google.maps.places.PlacesService(map);
//   service.nearbySearch(request, callback);
//   // output response of API call to console
//   function callback(results, status) {
//     if (status == google.maps.places.PlacesServiceStatus.OK) {
//       console.log(results[0].name);
//     }
//     else {
//       alert(status);
//     }
//   } 
// }
