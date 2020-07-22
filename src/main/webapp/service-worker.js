/** Testing how caching would work. */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1')
    .then(function(cache) {
      return cache.addAll([ 
        '/placeInfo-cache/',
        '/placeInfo-cache/cache.txt'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('using cache');
  event.respondWith(caches.match(event.request)
  .then(function(response) {
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        let responseClone = response.clone();

        caches.open('v1').then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function() {
        return caches.match('/placeInfo-cache/cache.txt');
      });
    }
  }));
});

function fetchTest() {
  var service = new google.maps.places.PlacesService(new google.maps.Map(document.getElementById('Map')));
  var request = {
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      fields: [
        'name',
        'rating',
        'formatted_address',
        'website',
        'business_status'
      ]
    };

    caches.match(request).then((response) => {
      if (response !== undefined) {
        response.json().then(data => {
          console.log("Name: " + data.name);
        });
      } else {
        service.getDetails(request, callback);
        function callback(place, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log('caching place');
            let placeClone = new Object();
            placeClone.name = place.name;
            placeClone.rating = place.rating;
            placeClone.formatted_address = place.formatted_address;
            placeClone.website = place.website;
            placeClone.business_status = place.business_status;
            placeBlob = new Blob([JSON.stringify(placeClone, null, 2)], {type : 'application/json'});
            response = new Response(placeBlob);
            console.log(response);
            caches.open('v1').then(function(cache) {
              cache.put(request, response);
            })
          } else { console.log(status); }
        }
      }
    });
}
