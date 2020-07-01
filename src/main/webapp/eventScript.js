/**
  function calls for body onload
 */
function onload() {
  navbarLoginDisplay();
  getLocationInfo();
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
  attendeeIDs.push(userId);
  attendeeNames.push(userName);
  document.getElementById("attendee-list").value = attendeeNames;
  document.getElementById("attendee-ID-list").value = attendeeIDs;
}
