// Global Variables
const API_KEY = displayKey();
const CREATE_EVENT_PAGE = 'createEventPage';
const EXPLORE_MAP_PAGE = 'exploreMapPage';
const SESSION_STORE_LOCATION = 'locationName';
const SESSION_STORE_PLACEID = 'placeId';
var markers = [];
/** Initial display of screen */
function initialDisplay() {
  navbarLoginDisplay(); // This function is located in profileScript.js
  initMap();
  fetchBlobstoreURL();
}

/** Initializes map and displays it. */
function initMap() {
  newCenterId = sessionStorage.getItem(SESSION_STORAGE_CURRENT_LOCATION);
  mapCenter = { lat: 37.4220, lng: -122.0841 };
  infoWindow = new google.maps.InfoWindow;
  var marker = new google.maps.Marker;
  marker.setIcon('/images/red-marker.png');
  var filterElements = document.getElementsByClassName('filter-button');
  
  var map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 15,
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
          filterItem.addEventListener('click', function(e) {
            highlightNearbyLocation(map, id, mapCenter);
            updateActiveStatus(filterElements, e);
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
    loaderElement = document.getElementById('loader-icon');
    findLocationTextElement = document.getElementById('finding-location-text');
    foundLocationTextElement = document.getElementById('found-location-text');
    loaderElement.style.display = 'block';
    findLocationTextElement.style.display = 'block';
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
        filterItem.addEventListener('click', function(e) {
          highlightNearbyLocation(map, id, mapCenter);
          updateActiveStatus(filterElements, e);
        });
      }
      loaderElement.style.display = 'none';
      findLocationTextElement.style.display = 'none';
      foundLocationTextElement.style.display = 'block';
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
  errorMessage = document.getElementById('error_message');
  errorMessage.innerText = '';
  deleteAllMarkers();
  var image = '/images/blue-marker.png';
  var request = {
    location: currentLocation,
    radius: '2000',
    type: [placeType]
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
  // output response of API call to console
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(map, results[i].geometry.location, results[i].place_id);
      }
      function createMarker(thisMap, location, markerPlaceId) {
        var marker = new google.maps.Marker({
          position: location,
          map: thisMap,
          icon: image
        })
        marker.addListener('click', function(e) {
          fetchPlaceInformation(markerPlaceId, map, EXPLORE_MAP_PAGE);
          e.stop(); // Stops infobox from appearing when location clicked
          });
        markers.push(marker);
      }
    }
    else {
      if (status == "ZERO_RESULTS") {
        errorMessage.innerText = 'No locations of this category found.';     
      };
    }
  } 
}

/** Updates active status of filter buttons.  */
function updateActiveStatus(listOfElements, evt) {
  for (var i = 0; i < listOfElements.length; i++) {
    listOfElements[i].className = listOfElements[i].className.replace(' active', '');
  }
  if (evt) { evt.currentTarget.className += ' active'; }
}

/** Deletes all markers on map. */
function deleteAllMarkers() {
    setMapOnAll(null);
    markers = [];
    updateActiveStatus(document.getElementsByClassName('filter-button'), null);
  }

/** Sets the map on all markers in the array. */
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

/** Fetches information about a place. */
function fetchPlaceInformation(place_id, map, where) {
  var service = new google.maps.places.PlacesService(map);
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

    // Creates a Request object for caching purposes.
    myRequest = new Request([JSON.stringify(request, null, 2)], {type : 'application/json'});
    caches.match(myRequest, {'ignoreVary' : true}).then((response) => {
      // If cache hit.
      if (response !== undefined) {
        response.json().then(place => {
          if (where == EXPLORE_MAP_PAGE) {
            displayPlaceInfo(place, place_id);
            return;
          }
          else if (where == CREATE_EVENT_PAGE) {
            // Updates sessionStorage and update input forms.
            sessionStorage.setItem(SESSION_STORE_LOCATION, place.name);
            sessionStorage.setItem(SESSION_STORE_PLACEID, place_id);
            getLocationInfo();
            return;
          }
        });
      } 
      // If cache miss.
      else {
        service.getDetails(request, callback);
        function callback(place, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            let placeClone = new Object();
            placeClone.name = place.name;
            placeClone.rating = place.rating;
            placeClone.formatted_address = place.formatted_address;
            placeClone.website = place.website;
            placeClone.business_status = place.business_status;
            placeBlob = new Blob(
              [JSON.stringify(placeClone, null, 2)], 
              {type : 'application/json'}
            );
            // Creates a Response object for caching purposes.
            response = new Response(placeBlob);
            caches.open('v1').then(function(cache) {
              cache.put(myRequest, response);
            })
            if (where == EXPLORE_MAP_PAGE) {
            displayPlaceInfo(place, place_id);
            return;
            }
            else if (where == CREATE_EVENT_PAGE) {
              // Updates sessionStorage and update input forms.
              sessionStorage.setItem(SESSION_STORE_LOCATION, place.name);
              sessionStorage.setItem(SESSION_STORE_PLACEID, place_id);
              getLocationInfo();
              return;
            }
          } 
          else { 
            alert('PlacesService failed to find desired location: ' + status); 
            return;
          }
        }
      }
    });
  // }
}

/** Display place information on sidebar */
function displayPlaceInfo(place, placeId) {
  sessionStorage.setItem(SESSION_STORE_LOCATION, place.name);
  sessionStorage.setItem(SESSION_STORE_PLACEID, placeId);
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
  createEventElement = document.createElement('button');
  createEventElement.className = "button";
  createPostElement = document.createElement('button');
  createPostElement.className = "button";

  interestContainerElement = document.createElement('div');
  interestContainerElement.id = 'map-interest-container';
  interestButtonElement = document.createElement('i');
  interestButtonElement.className = 'fa fa-heart-o';
  interestTextElement = document.createElement('p');
  interestTextElement.innerText = 'Save as interest';
  interestContainerElement.appendChild(interestButtonElement);
  interestContainerElement.appendChild(interestTextElement);
  
  nameElement.innerText = place.name;
  addressElement.innerText = 'Address: ' + place.formatted_address;
  // function to create tab and return tab div element
  tabDivElement = createTabElement();
  createEventElement.innerText = 'Create an Event';
  createEventElement.addEventListener('click', () => {
    location.href = 'CreateAnEvent.html';
  });
  createPostElement.innerText = "Create a Post";
  createPostElement.addEventListener('click', () => {
    createPostForm();
    document.getElementById("post-form").style.display = 'block';
  });
  if (place.business_status) {
    businessStatusElement = document.createElement('p');
    businessStatusElement.innerText = 'Business Status: ' + place.business_status;
  }
  interestButtonElement.addEventListener('click', () => {
    saveOrRemoveInterest(place.name, placeId, interestButtonElement, interestTextElement);
  });

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

  if (localStorage.getItem(LOCAL_STORAGE_STATUS) === 'true') {
    let userId = localStorage.getItem(LOCAL_STORAGE_ID);
    setInterestButton(interestButtonElement, interestTextElement, placeId, userId);
    infoDivElement.appendChild(interestContainerElement);
    eventsDivElement.appendChild(createEventElement);
    eventsDivElement.appendChild(getAvailableEvents(userId)); 
    userPostsDivElement.appendChild(createPostElement); 
    userPostsDivElement.appendChild(getAvailablePosts(userId)); 
  }
  else {
    eventsDivElement.appendChild(getPublicEvents());
    userPostsDivElement.appendChild(getPublicPosts());
  }
  infoDivElement.appendChild(tabDivElement);
  infoDivElement.appendChild(eventsDivElement);
  infoDivElement.appendChild(userPostsDivElement);
  document.getElementById('open').click();
  sideBarElement.appendChild(infoDivElement);
  return sideBarElement;
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
  tabDivElement.appendChild(eventsButtonElement);
  tabDivElement.appendChild(postsButtonElement);
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

/** Sends post request to store or remove saved interest. */
function saveOrRemoveInterest(locationName, placeId, interestButtonElement, interestTextElement) {
  const params = new URLSearchParams()
  params.append('place-id', placeId);
  params.append('location-name', locationName);
  fetch('/interest', {
    method: 'POST', body: params
  }).then(switchInterestButton(interestButtonElement, interestTextElement));
}

/** Switches the text of the interest button. */
function switchInterestButton(interestButtonElement) {
  if (interestTextElement.innerText === 'Saved as interest') {
    interestButtonElement.className = 'fa fa-heart-o';
    interestTextElement.innerText = 'Save as interest';
  } else {
    interestButtonElement.className = 'fa fa-heart';
    interestTextElement.innerText = 'Saved as interest';
  }
}

/** Sets interest button's display based on whether it has already been saved by the user. */
function setInterestButton(interestButtonElement, interestTextElement, placeId, userId) {
  alreadySaved = false;
  fetch('/interest').then(response => response.json()).then((interests) => {
    for (let i = 0; i < interests.length; i ++) {
      if (interests[i].placeId === placeId && 
          interests[i].interestedUsers.includes(userId)) {
        alreadySaved = true;
        interestButtonElement.className = 'fa fa-heart';
        interestTextElement.innerText = 'Saved as interest';
      }
    }
  });
}
