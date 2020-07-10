/**
  function calls for body onload
 */
function onload() {
  navbarLoginDisplay();
  getLocationInfo();
  createMapSnippet();
}

/**
  display attendees input only if the privacy specified 
  is "attendees"
*/
function specifiedAttendees(value) {
  if (value == "attendees") {
    document.getElementById("attendees-wrap").style.display = "block";
    userSearch();
  }
  else {
    document.getElementById("attendees-wrap").style.display = "none";
  }
}

function userSearch() {
  const loadedUsers = document.getElementById('loaded-users');
  loadedUsers.innerHTML = '';
  
  fetch('/user').then(response => response.json()).then((users) => {
    for (let i = 0; i < users.length; i++) {
      loadedUsers.appendChild(loadUser(users[i]));
    }
  });
}

var attendeeNames = new Array();
var attendeeIDs = new Array();

function loadUser(user) {
  const userDisplay = document.createElement('p');
  userDisplay.innerText = user.name;
  userDisplay.addEventListener('click', () => {
    appendInfo(user.id, user.name);
  });
  return userDisplay;
}

function appendInfo(userId, userName) {
  document.getElementById("warning").innerHTML = "";
  if (attendeeIDs.includes(userId)) {
    document.getElementById("warning").innerHTML = 
    "<p>User is already added to list</p>";
  }
  else {
    attendeeIDs.push(userId);
    attendeeNames.push(userName);
    document.getElementById("attendee-list").value = attendeeNames;
    document.getElementById("attendee-ID-list").value = attendeeIDs;
  }
}

function submitForm() {
  const params = new URLSearchParams();
  params.append("event-name", document.getElementById("event-name").value);
  params.append("start-date", document.getElementById("start-date").value);
  params.append("start-time", document.getElementById("start-time").value);
  params.append("end-date", document.getElementById("end-date").value);
  params.append("end-time", document.getElementById("end-time").value);
  params.append("location", document.getElementById("location").value);
  params.append("event-details", document.getElementById("event-details").value);
  params.append("privacy", document.getElementById("privacy").value);
  params.append("attendee-ID-list", document.getElementById("attendee-ID-list").value);
  params.append("COVID-Safe", document.getElementById("COVID-Safe").value);

  const request = new Request('/events', {method: 'POST', body: params});
  fetch(request)
    .then(response => response.json())
    .then(json => {
      if (json['bad-time'] == "true") {
        document.getElementById('date-warning').innerHTML = "";
        document.getElementById("success").innerHTML = "";
        document.getElementById('date-warning').innerHTML = 
          "<p>Please make sure the end date and time are after the start " +
          "date and time </p>"
      }
      else if (json['success'] == 'true') {
        document.getElementById("success").innerHTML = "";
        document.getElementById("date-warning").innerHTML = "";
        var placeId = document.getElementById('place-id').value;
        sessionStorage.setItem("currentLocationId", placeId);
        document.getElementById("success").innerHTML = 
          "<p>Event created successfully. Click <a href=\"/map.html\">here</a>" +
          " to return to the map</p>";
      }
    });
} 