/**
  function calls for body onload
 */
function onload() {
  navbarLoginDisplay();
  getLocationInfo();
  createMapSnippet();
}

/**
  change display based on privacy setting
*/
function specifiedAttendees(value) {
  if (value == "attendees") {
    document.getElementById("attendees-wrap").style.display = "block";
    document.getElementById("invited-attendee-ID-list").style.display = "none";
    userSearch();
  }
  else if (value == "buddies-only") {
    buddiesOnly();
    document.getElementById("attendees-wrap").style.display = "none";
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
attendeeIDs.push("");

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
    document.getElementById("invited-attendee-list").value = attendeeNames;
    document.getElementById("invited-attendee-ID-list").value = attendeeIDs;
  }
}

function buddiesOnly() {
  var buddyIds = new Array();
  fetch("/buddy")
    .then(response => response.json())
    .then(buddies => {
      for (let i = 1; i < buddies.length; i++) {
        buddyIds.push(buddies[i]);
      }
      document.getElementById("invited-attendee-ID-list").value = "";
      document.getElementById("invited-attendee-ID-list").value = buddyIds;
    });
}

function submitForm() {
  const params = new URLSearchParams();
  filledIn = checkFillIn();

  if (filledIn) {
    params.append("event-name", document.getElementById("event-name").value);
    params.append("start-date", document.getElementById("start-date").value);
    params.append("start-time", document.getElementById("start-time").value);
    params.append("end-date", document.getElementById("end-date").value);
    params.append("end-time", document.getElementById("end-time").value);
    params.append("location", document.getElementById("location").value);
    params.append("place-id", document.getElementById("place-id").value);
    params.append("event-details", document.getElementById("event-details").value);
    params.append("privacy", document.getElementById("privacy").value);
    params.append("invited-attendee-ID-list", document.getElementById("invited-attendee-ID-list").value);
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
} 
function checkFillIn() {
  var fillIn = "<p>Please fill our all sections with an * by them</p>";
  if (document.getElementById("event-name").value === "") {
    document.getElementById("success").innerHTML = fillIn;
    return false;
  }
  else if (document.getElementById("start-date").value === "") {
    document.getElementById("success").innerHTML = fillIn;
    return false;
  }
  else if (document.getElementById("start-time").value === "") {
    document.getElementById("success").innerHTML = fillIn;
    return false;
  }
  else if (document.getElementById("end-date").value === "") {
    document.getElementById("success").innerHTML = fillIn;
    return false;
  }
  else if (document.getElementById("end-time").value === "") {
    document.getElementById("success").innerHTML = fillIn;
    return false;
  }
  else if (document.getElementById("privacy").value === "") {
    document.getElementById("success").innerHTML = fillIn;
    return false;
  }
  else if (document.getElementById("COVID-Safe").value === "") {
    document.getElementById("success").innerHTML = fillIn;
    return false;
  }
  else {
    return true;
  }
}