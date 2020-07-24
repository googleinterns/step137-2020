/**
  function calls for body onload
 */
function onload() {
  navbarLoginDisplay();
  getLocationInfo();
  createMapSnippet();
}

/**
  Change display based on privacy setting.
*/
function specifiedAttendees(value) {
  if (value == "attendees") {
    document.getElementById("attendees-wrap").style.display = "block";
    document.getElementById("invited-attendee-ID-list").style.display = "none";
    document.getElementById("invited-attendee-list").style.display = "none";
  }
  else if (value == "buddies-only") {
    buddiesOnly();
    document.getElementById("attendees-wrap").style.display = "none";
  } 
  else {
    document.getElementById("attendees-wrap").style.display = "none";
  }
}

function displayUsers() {
  const loadedUsers = document.getElementById('loaded-users');
  const attendeeText = document.getElementById('attendee-text').value;
  if (attendeeText === '') {
    // Don't return results for an empty search.
    loadedUsers.innerHTML = '';
  } else {
    fetch('/user').then(response => response.json()).then((users) => {
      loadedUsers.innerHTML = '';
      let userCount = 0;
      let userId = localStorage.getItem(LOCAL_STORAGE_ID);
      for (let i = 0; i < users.length; i ++) {
        if (users[i].name.includes(attendeeText) && users[i].id != userId) {
          // Display any users whose name contains the search text.
          loadedUsers.appendChild(loadUser(users[i]));
          userCount ++;
        }
      }
      if (userCount == 0) {
        const searchMessage = document.createElement('p');
        searchMessage.innerText = 'No users with that name could be found.';
        loadedUsers.appendChild(searchMessage);
      }
    });
  }
}

var attendees = new Array();
var attendeeNames = new Array();
var attendeeIDs = new Array();
attendeeIDs.push("");

function loadUser(user) {
  const userDisplay = document.createElement('div');
  userDisplay.className = "user-display";
  userDisplay.appendChild(createAttendeeDisplay(user, "no"));
  userDisplay.addEventListener('click', () => {
    appendInfo(user, userDisplay);
  });
  
  return userDisplay;
}

function appendInfo(user, userDisplay) {
  document.getElementById("warning").innerHTML = "";
  
  if (attendeeIDs.includes(user.id)) {
    document.getElementById("warning").innerHTML = 
    "<p>User is already added to list</p>";
  }

  else {
    attendees.push(user);
    attendeeIDs.push(user.id);
    attendeeNames.push(user.name);
    
    const displayAttendees = document.getElementById("display-invited-names");
    displayAttendees.innerHTML = '';
    displayAttendees.className = "user-display";
    const selectedUser = document.createElement('div');
    for (let i = 0; i < attendees.length; i ++) {
      selectedUser.appendChild(createAttendeeDisplay(attendees[i], "yes"));
    }
    displayAttendees.appendChild(selectedUser);
    
    document.getElementById("invited-attendee-list").value = attendeeNames;
    document.getElementById("invited-attendee-ID-list").value = attendeeIDs;
  }
}

function createAttendeeDisplay(user, check) {
  const selectedUser = document.createElement('div');
  selectedUser.className = "user-display";
  fetch("/user")
    .then(response => response.json())
    .then(users => {
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === user.id) {
          displayProfilePicture(users[i], selectedUser, 'profile-pic-small');
          const name = document.createElement('p');
          name.innerText = users[i].name;
          selectedUser.append(name);
        }
      }
      if (check === "yes") {
        const checkIcon = document.createElement('i');
        checkIcon.className = "fa fa-times";
        checkIcon.addEventListener('click', () => {
          deleteAttendee(selectedUser, user);
        })
        selectedUser.append(checkIcon);
      }
    });
  return selectedUser;
}

function deleteAttendee(selectedUser, user) {
  selectedUser.innerHTML = '';
  //remove from all three lists 
  index = attendees.indexOf(user);
  if (index > -1) {
    attendees.splice(index, 1);
  }
  index = attendeeIDs.indexOf(user.id);
  if (index > -1) {
    attendeeIDs.splice(index, 1);
    document.getElementById("invited-attendee-ID-list").value = attendeeIDs;
  }
  index = attendeeNames.indexOf(user.name);
  if (index > -1) {
    attendeeNames.splice(index, 1);
    document.getElementById("invited-attendee-list").value = attendeeNames;
  }
}

/**If user selects buddies only as their privacy method, stores the user's
  buddie's ids in a text box in the form so they can be submitted with the form. */
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

/** Sends a POST request to the /events servlet to create a post. */
function submitForm() {
  const params = new URLSearchParams();
  filledIn = checkFillIn();

  if (filledIn) {
    params.append("event-name", document.getElementById("event-name").value);
    params.append("start-date", document.getElementById("start-date").value);
    params.append("start-time", document.getElementById("start-time").value);
    params.append("end-date", document.getElementById("end-date").value);
    params.append("end-time", document.getElementById("end-time").value);
    params.append("time-zone", document.getElementById("time-zone").value);
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
          document.getElementById("success").style.color = "black";
          document.getElementById("success").innerHTML = 
            "<p>Event created successfully. Click <a href=\"/map.html\">here</a>" +
            " to return to the map</p>";
        }
      });
  }
} 
/** Makes sure all required fields of the form are filled in. */
function checkFillIn() {
  var fillIn = "<p>Please fill our all sections with an * by them</p>";
  document.getElementById("success").style.color = "red";
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

/**
  Get all public events to display on map page even when user isn't logged in.
 */
function getPublicEvents() {
  eventDivElement = document.createElement("div");
  eventDivElement.innerText = '';
  locationName = sessionStorage.getItem(SESSION_STORE_LOCATION);

  fetch("/events")
    .then(response => response.json())
    .then(events => {
      if (events.length === 0) {
        noEventElement = document.createElement('p');
        noEventElement.innerText = "No events to show.";
        eventDivElement.appendChild(noEventElement);
      }
      else {
        for (i = 0; i < events.length; i++) {
          if (events[i].location == locationName 
              && events[i].privacy == "public") {
              eventDivElement.appendChild(createEventNoResponse(events[i]));
          }
        }
      }
    });
  return eventDivElement;
}

/**
  Gets events the user is allowed to see.
*/
function getAvailableEvents(userID) {
  eventDivElement = document.createElement("div");
  eventDivElement.innerText = '';
  locationName = sessionStorage.getItem(SESSION_STORE_LOCATION);

  fetch('/events')
    .then(response => response.json())
    .then(events => {
      let count = 0;
      for (i = 0; i < events.length; i++) {
        if (events[i].location == locationName) {
          invitedAttendees = events[i].invitedAttendees;
          rsvpAttendees = events[i].rsvpAttendees;
          rsvpContains = rsvpAttendees.includes(userID);
          if (events[i].privacy == "public") {
            // Display public events even if user is not attending.
            if (!rsvpContains) {
              eventDivElement.appendChild(createEventWithResponse(events[i], userID, "false"));
              count++;
            }
          }
          if (rsvpContains) {
            // Display events the user is attending.
            eventDivElement.appendChild(createEventWithResponse(events[i], userID, "true"));
            count++;
          }
          else if (invitedAttendees.includes(userID)) {
            // Display events the user is invited to.
            eventDivElement.appendChild(createEventWithResponse(events[i], userID, "false"));
            count++;
          }
        }
      }
      if (count === 0) {
        noEventElement = document.createElement('p');
        noEventElement.innerText = "No events to show.";
        eventDivElement.appendChild(noEventElement);      
      }
    });
  return eventDivElement;
}

/* Creates a basic event with no option to RSVP. */
function createEventNoResponse(event) {
  const eventElement = document.createElement('div');
  eventElement.className = "card";

  const eventContents = document.createElement('div');
  eventContents.className = "contents";

  const eventName = document.createElement('h2');
  eventName.className = "name-display";
  eventName.innerText = event.eventName;

  const eventDate = document.createElement('p');
  eventDate.className = "date-display";
  eventDate.innerText = event.dateTime;

  const locationDisplay = document.createElement('div');
  locationDisplay.className = "location-display";
  const locationIcon = document.createElement('i');
  locationIcon.className = 'fa fa-map-marker';
  const eventLocation = document.createElement('p');
  eventLocation.className = "location-name";
  eventLocation.innerText = event.location;
  locationDisplay.append(locationIcon);
  locationDisplay.append(eventLocation);
  
  if (window.location.pathname === '/profile.html') {
    locationDisplay.addEventListener('click', () => {
      sessionStorage.setItem(SESSION_STORAGE_CURRENT_LOCATION, event.placeId);
      window.location.href = 'map.html';
    });
  }

  const eventDetails = document.createElement('p'); 
  eventDetails.className = "details-display";
  if (event.eventDetails.length > 0) {
    eventDetails.innerText = 'Details: ' + event.eventDetails;
  }

  const topOfEvent = document.createElement('div');
  topOfEvent.id = "top-event";

  const creatorName = document.createElement('div');
  creatorName.id = "event-creator";
  fetch("/user")
    .then(response => response.json())
    .then(users => {
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === event.creator) {
          displayProfilePicture(users[i], creatorName, 'profile-pic-small');
          const name = document.createElement('p');
          name.id = 'event-creator-name';
          name.innerText = "Created by " + users[i].name;
          creatorName.addEventListener('click', () => {
            visitProfile(users[i].id);
          });
          creatorName.append(name);
        }
      }
    });
  
  topOfEvent.append(creatorName);
  
  if (event.yesCOVIDSafe === "yes") {
    const covidBadge = document.createElement('img');
    covidBadge.src = "images/mask.png";
    covidBadge.height = 20;
    covidBadge.width = 20;
    covidBadge.id = "covid-badge";
    topOfEvent.append(covidBadge);
  }
  eventElement.append(eventContents);
  eventElement.append(topOfEvent);
  eventElement.append(eventName);
  eventElement.append(eventDate);
  eventElement.append(locationDisplay);
  eventElement.append(eventDetails);
  return eventElement;
}

/* Creates an event for logged in users with the option to RSVP. */
function createEventWithResponse(event, userID, going) {
  const eventElement = createEventNoResponse(event);

  const bottomCard = document.createElement('div');
  bottomCard.id = "bottom-event-wrapper";

  const attendeeInfo = document.createElement('div');
  attendeeInfo.id = 'attendee-info-container';

  if (event.privacy === 'public') {
    const publicIndicator = document.createElement('p');
    publicIndicator.className = 'attendee-info';
    publicIndicator.innerText = 'Public';
    attendeeInfo.appendChild(publicIndicator);
  } else {
    const privateIndicator = document.createElement('p');
    privateIndicator.className = 'attendee-info';
    privateIndicator.innerText = 'Private';
    attendeeInfo.appendChild(privateIndicator);

    const invitedAttendees = document.createElement('p');
    invitedAttendees.id = 'invited-attendees';
    invitedAttendees.className = 'attendee-info';
    invitedAttendees.innerText = (event.invitedAttendees.length) + ' Invited';
    invitedAttendees.addEventListener('click', () => {
      displayAttendees(event, 'invited')
    });
    attendeeInfo.appendChild(invitedAttendees);
  }
  const goingAttendees = document.createElement('p');
  goingAttendees.id = 'going-attendees';
  goingAttendees.className = 'attendee-info';
  goingAttendees.innerText = (event.rsvpAttendees.length - 1) + ' Going';
  goingAttendees.addEventListener('click', () => {
    displayAttendees(event, 'going')
  });
  attendeeInfo.appendChild(goingAttendees);
  bottomCard.appendChild(attendeeInfo);
  
  const rsvpButton = document.createElement('button');
  rsvpButton.id = 'rsvp-button';
  rsvpButton.innerText = "Going";
  setRSVPButtonColor(rsvpButton, going);
  rsvpButton.addEventListener('click', () => {
    addRemoveAttendee(event, rsvpButton);
  });
  bottomCard.appendChild(rsvpButton);

  if (userID === event.creator) {
    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-button';
    deleteButton.className = "button icon-button";
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa fa-trash-o';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', () => {
      deleteSingleEvent(event, eventElement);
    });
    bottomCard.append(deleteButton);
  }

  eventElement.append(bottomCard);
  return eventElement;
}

/** Displays a popup with the list of an event's attendees. */
function displayAttendees(event, attendeeType) {
  // Create an empty popup with a heading and an exit button.
  const attendeesPopup = document.getElementById('attendees-popup');
  attendeesPopup.innerHTML = '';
  const attendees = document.createElement('div');
  attendees.className = 'popup-text';
  const attendeesHeading = document.createElement('h3');
  if (attendeeType === 'invited') {
    attendeesHeading.innerText = 'Buddies Invited';
  } else {
    attendeesHeading.innerText = 'Buddies Going';
  }
  const exitButton = document.createElement('i');
  exitButton.className = 'fa fa-close';
  exitButton.addEventListener('click', () => {
    attendeesPopup.style.display = 'none';
  });
  attendees.appendChild(attendeesHeading)
  attendees.appendChild(exitButton);

  // Display attendees of the specified type that are buddies with the current user.
  const currentId = localStorage.getItem(LOCAL_STORAGE_ID);
  let buddyIds;
  let attendeeUsers = [];
  let attendeesCount = 0;
  fetch('/user').then(response => response.json()).then((users) => {
    for (let i = 0; i < users.length; i ++) {
      if (users[i].id === currentId) {
        buddyIds = users[i].buddies;
      }
      if (attendeeType === 'invited') {
        if (event.invitedAttendees.includes(users[i].id)) {
          attendeeUsers.push(users[i]);
        }
      } else {
        if (event.rsvpAttendees.includes(users[i].id)) {
          attendeeUsers.push(users[i]);
        }
      }  
    }
    for (let i = 0; i < attendeeUsers.length; i ++) {
      if (buddyIds.includes(attendeeUsers[i].id)) {
        attendees.appendChild(createUserElement(attendeeUsers[i]));
        attendeesCount ++;
      }
    }
    if (attendeesCount == 0) {
      attendees.appendChild(createNoAttendeesMessage(attendeeType));
    }
    attendeesPopup.appendChild(attendees);
  });
  attendeesPopup.style.display = 'block';
}

/** Creates a message to be displayed when there are no attendees of the specified type. */
function createNoAttendeesMessage(attendeeType) {
  const noAttendeesMessage = document.createElement('p');
  if (attendeeType === 'invited') {
    noAttendeesMessage.innerText = 'No buddies are invited to this event.';
  } else {
    noAttendeesMessage.innerText = 'No buddies are going to this event.';
  }
  return noAttendeesMessage;
}

/**sets the color of the RSVP button on onload */
function setRSVPButtonColor(rsvpButton, going) {
  if (going === "true") {
    rsvpButton.className = "button button-selected";
  }
  else {
    rsvpButton.className = "button";
  }
}

function addRemoveAttendee(event, rsvpButton) {
  const params = new URLSearchParams();
  params.append('eventId', event.eventId);
  fetch('/add-remove-attendee', {
    method: 'POST', body: params
  }).then(switchRSVPButtonColor(event, rsvpButton));
}

/**change color in RSVP button when user clicks it */
function switchRSVPButtonColor(event, rsvpButton) {
  if (rsvpButton.className === "button") {
    rsvpButton.className = " button button-selected";
    updateAttendeeCount(event, 'going');
  }
  else {
    rsvpButton.className = "button";
    updateAttendeeCount(event, 'not-going');
  }
  if (window.location.pathname === '/profile.html') {
    profileOnload();
  }
}

/**Deleting a single event when trash button on event is clicked */
function deleteSingleEvent(event, eventElement) {
  const params = new URLSearchParams();
  params.append('id', event.eventId);
  fetch('/delete-single-event', {
    method: 'POST', body: params
  }).then(eventElement.style.display = "none");
}

/** Updates the attendee count when a user RSVPs. */
function updateAttendeeCount(event, decision) {
  const goingAttendees = document.getElementById('going-attendees');
  const goingText = goingAttendees.innerText;
  const currentGoingCount = parseInt(goingText.substr(0, goingText.indexOf(' ')));
  if (event.privacy !== 'public') {
    // Update count of invited users.
    const invitedAttendees = document.getElementById('invited-attendees');
    const invitedText = invitedAttendees.innerText;
    const currentInvitedCount = parseInt(invitedText.substr(0, invitedText.indexOf(' ')));
    if (decision === 'going') {
      const newInvitedCount = currentInvitedCount - 1;
      invitedAttendees.innerText = newInvitedCount + ' Invited';
    } else {
      const newInvitedCount = currentInvitedCount + 1;
      invitedAttendees.innerText = newInvitedCount + ' Invited';
    }
  }
  // Update count of going users.
  if (decision === 'going') {
    const newGoingCount = currentGoingCount + 1;
    goingAttendees.innerText = newGoingCount + ' Going';
  } else {
    const newGoingCount = currentGoingCount - 1;
    goingAttendees.innerText = newGoingCount + ' Going';
  }
}
