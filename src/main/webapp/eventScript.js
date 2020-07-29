// Global Variables
const CURRENT_EVENT = "event";
let EDITING;

/**
  function calls for body onload
 */
function onload() {
  navbarLoginDisplay();
  getLocationInfo();
  createMapSnippet();
  //determine whether to fill in form 
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('fillIn') === "yes") {
    displayEventFormFilledIn();
  }
  if (urlParams.get('editing') === "yes") {
    EDITING = "yes";
  }
  else {
    EDITING = "no";
  }
}

/**
  Change display based on privacy setting.
*/
function specifiedAttendees(value) {
  if (value == "attendees") {
    document.getElementById("attendees-wrap").style.display = "block";
    document.getElementById("invited-attendee-ID-list").style.display = "none";
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
    
    const displayAttendees = document.getElementById("display-invited-names");
    displayAttendees.innerHTML = '';
    displayAttendees.className = "user-display";
    const selectedUser = document.createElement('div');
    for (let i = 0; i < attendees.length; i ++) {
      selectedUser.appendChild(createAttendeeDisplay(attendees[i], "yes"));
    }
    displayAttendees.appendChild(selectedUser);
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
}

/**If user selects buddies only as their privacy method, stores the user's
  buddie's ids in a text box in the form so they can be submitted with the form. */
function buddiesOnly() {
  var buddyIds = new Array();
  fetch("/buddy")
    .then(response => response.json())
    .then(buddies => {
      buddyIds.push("");
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
    params.append("location", document.getElementById("location").value);
    params.append("place-id", document.getElementById("place-id").value);
    params.append("event-details", document.getElementById("event-details").value);
    params.append("privacy", document.getElementById("privacy").value);
    params.append("invited-attendee-ID-list", document.getElementById("invited-attendee-ID-list").value);
    params.append("COVID-Safe", document.getElementById("COVID-Safe").value);
    params.append("time-zone", document.getElementById("time-zone").value);

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
          sessionStorage.setItem("whichTabToOpen", "Events");
          document.getElementById("success").style.color = "black";
          document.getElementById("success").innerHTML = 
            "<p>Event created successfully. Click <a href=\"/map.html\">here</a>" +
            " to return to the map</p>";
        }
        else if (json['success'] === 'edit') {
          document.getElementById("success").innerHTML = "";
          document.getElementById("date-warning").innerHTML = "";
          var placeId = document.getElementById('place-id').value;
          sessionStorage.setItem("currentLocationId", placeId);
          document.getElementById("success").style.color = "black";
          document.getElementById("success").innerHTML = 
            "<p>Event edited successfully. Click <a href=\"/map.html\">here</a>" +
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
        if (events[i].currency === "current") {
          if (events[i].location == locationName) {
            if (events[i].privacy === 'public' || events[i].invitedAttendees.includes(userID)) {
              eventDivElement.appendChild(createEventWithResponse(events[i], userID));
              count ++;
            }
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

  const privacyDisplay = document.createElement('p');
  privacyDisplay.className = "privacy-display";
  if (event.privacy === 'public') {
    privacyDisplay.innerText = 'Public';
  } else {
    privacyDisplay.innerText = 'Private';
  }

  const eventDetails = document.createElement('p'); 
  eventDetails.className = "details-display";
  if (event.eventDetails.length > 0) {
    eventDetails.innerText = 'Details: ' + event.eventDetails;
  }

  const topOfEvent = document.createElement('div');
  topOfEvent.className = "top-card";

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
  eventElement.append(privacyDisplay);
  eventElement.append(eventDetails);
  return eventElement;
}

/* Creates an event for logged in users with the option to RSVP. */
function createEventWithResponse(event, userID) {
  const goingStatus = getGoingStatus(event, userID);

  const eventElement = createEventNoResponse(event);

  const bottomCard = document.createElement('div');
  bottomCard.id = "bottom-event-wrapper";

  const attendeeInfo = document.createElement('div');
  attendeeInfo.id = 'attendee-info-container';

  const goingAttendees = document.createElement('p');
  goingAttendees.id = 'going-attendees';
  goingAttendees.className = 'attendee-info';
  const numGoing = event.goingAttendees.length - 1
  goingAttendees.innerText = numGoing + ' Going';
  goingAttendees.addEventListener('click', () => {
    displayAttendees(event, 'going')
  });
  attendeeInfo.appendChild(goingAttendees);

  const notGoingAttendees = document.createElement('p');
  const undecidedAttendees = document.createElement('p');

  if (event.privacy !== "public") {
    notGoingAttendees.id = 'not-going-attendees';
    notGoingAttendees.className = 'attendee-info';
    const numNotGoing = event.notGoingAttendees.length - 1
    notGoingAttendees.innerText = numNotGoing + ' Not Going';
    notGoingAttendees.addEventListener('click', () => {
      displayAttendees(event, 'not-going')
    });
    attendeeInfo.appendChild(notGoingAttendees);

    undecidedAttendees.id = 'undecided-attendees';
    undecidedAttendees.className = 'attendee-info';
    numUndecided = event.invitedAttendees.length - numGoing - numNotGoing - 1;
    undecidedAttendees.innerText = numUndecided + ' Undecided';
    undecidedAttendees.addEventListener('click', () => {
      displayAttendees(event, 'undecided')
    });
    attendeeInfo.appendChild(undecidedAttendees);
  }
  bottomCard.appendChild(attendeeInfo);
  
  if (event.currency === 'current') {
    const goingButton = document.createElement('button');
    goingButton.id ='going-button';
    goingButton.innerText = 'Going';

    const notGoingButton = document.createElement('button');
    notGoingButton.id = 'not-going-button';
    notGoingButton.innerText = 'Not Going';

    setRSVPButtonColor(goingStatus, goingButton, notGoingButton);

    goingButton.addEventListener('click', () => {
      addRemoveAttendee(event, 'going', goingButton, notGoingButton, 
          goingAttendees, notGoingAttendees, undecidedAttendees);
    })
    notGoingButton.addEventListener('click', () => {
      addRemoveAttendee(event, 'not-going', goingButton, notGoingButton, 
          goingAttendees, notGoingAttendees, undecidedAttendees);
    });

    bottomCard.appendChild(goingButton);
    if (event.privacy !== 'public') {
      bottomCard.appendChild(notGoingButton);
    }
  } else {
    const pastMessage = document.createElement('p');
    pastMessage.innerText = 'This event has already occurred.';
    bottomCard.appendChild(pastMessage);
  }

  if (userID === event.creator) {
    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-button';
    deleteButton.className = 'button icon-button';
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa fa-trash-o';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', () => {
      deleteSingleEvent(event, eventElement);
    });
    
    const editEventButton = document.createElement('i');
    editEventButton.id = 'edit-event-button';
    editEventButton.className = 'fa fa-edit';
    editEventButton.addEventListener('click', () => {
      storeEventThenEdit(event);
    });
    
    bottomCard.append(deleteButton);
    bottomCard.append(editEventButton);
  }

  eventElement.append(bottomCard);

  return eventElement;
}

/** Returns whether a user is going, not going, or invited to an event. */
function getGoingStatus(event, userID) {
  if (event.goingAttendees.includes(userID)) {
    return 'going';
  } else if (event.notGoingAttendees.includes(userID)) {
    return 'not-going';
  } else {
    return 'undecided';
  }
}

/** Displays a popup with the list of an event's attendees. */
function displayAttendees(event, attendeeType) {
  const currentId = localStorage.getItem(LOCAL_STORAGE_ID);
  let creatorView = false;
  if (currentId === event.creator) {
    creatorView = true;
  }

  // Create an empty popup with a heading and an exit button.
  const attendeesPopup = document.getElementById('attendees-popup');
  attendeesPopup.innerHTML = '';
  const attendees = document.createElement('div');
  attendees.className = 'popup-text';
  const attendeesHeading = document.createElement('h3');
  if (creatorView) {
    // Creator should be able to see all users attending the event.
    if (attendeeType === 'going') {
      attendeesHeading.innerText = 'Users Going';
    } else if (attendeeType === 'not-going') {
      attendeesHeading.innerText = 'Users Not Going';
    } else {
      attendeesHeading.innerText = 'Users Undecided';
    }
  } else {
    // Other users should be able to see buddies attending the event.
    if (attendeeType === 'going') {
      attendeesHeading.innerText = 'Buddies Going';
    } else if (attendeeType === 'not-going') {
      attendeesHeading.innerText = 'Buddies Not Going';
    } else {
      attendeesHeading.innerText = 'Buddies Undecided';
    }
  }

  const exitButton = document.createElement('i');
  exitButton.className = 'fa fa-close';
  exitButton.addEventListener('click', () => {
    attendeesPopup.style.display = 'none';
  });
  attendees.appendChild(attendeesHeading)
  attendees.appendChild(exitButton);

  fetch("/events").then(response => response.json()).then(events => {
    for (let i = 0; i < events.length; i ++) {
      if (events[i].eventId === event.eventId) {
        let updatedEvent = events[i];
        // Display attendees of the specified type that are buddies with the current user.
        let buddyIds;
        let attendeeUsers = [];
        let attendeesCount = 0;
        fetch('/user').then(response => response.json()).then((users) => {
          for (let i = 0; i < users.length; i ++) {
            if (users[i].id === currentId) {
              buddyIds = users[i].buddies;
            }
            if (attendeeType === 'going') {
              if (updatedEvent.goingAttendees.includes(users[i].id)) {
                attendeeUsers.push(users[i]);
              } 
            } else if (attendeeType === 'not-going') {
              if (updatedEvent.notGoingAttendees.includes(users[i].id)) {
                attendeeUsers.push(users[i]);
              }
            } else if (attendeeType === 'undecided') {
              if (updatedEvent.invitedAttendees.includes(users[i].id) && 
                  !(updatedEvent.goingAttendees.includes(users[i].id) || 
                      updatedEvent.notGoingAttendees.includes(users[i].id))) {
                attendeeUsers.push(users[i]);
              }
            }
          }
          for (let i = 0; i < attendeeUsers.length; i ++) {
            if (creatorView || buddyIds.includes(attendeeUsers[i].id)) {
              attendees.appendChild(createUserElement(attendeeUsers[i]));
              attendeesCount ++;
            }
          }
          if (attendeesCount == 0) {
            attendees.appendChild(createNoAttendeesMessage(attendeeType, creatorView));
          }
          attendeesPopup.appendChild(attendees);
        });
      }
    }  
  });
  attendeesPopup.style.display = 'block';
}

/** Creates a message to be displayed when there are no attendees of the specified type. */
function createNoAttendeesMessage(attendeeType, creatorView) {
  const noAttendeesMessage = document.createElement('p');
  if (creatorView) {
    if (attendeeType === 'going') {
      noAttendeesMessage.innerText = 'Users going to your event will be displayed here.';
    } else if (attendeeType === 'not-going') {
      noAttendeesMessage.innerText = 'Users not going to your event will be displayed here.';
    } else {
      noAttendeesMessage.innerText = 'Users invited to your event who have not responded will be displayed here.';
    }
    return noAttendeesMessage;
  } else {
    if (attendeeType === 'going') {
      noAttendeesMessage.innerText = 'Buddies going to the event will be displayed here.';
    } else if (attendeeType === 'not-going') {
      noAttendeesMessage.innerText = 'Buddies not going to the event will be displayed here.';
    } else {
      noAttendeesMessage.innerText = 'Buddies invited to the event who have not responded will be displayed here.';
    }
    return noAttendeesMessage;
  }
}

/** Sets the color of the RSVP button on onload. */
function setRSVPButtonColor(goingStatus, goingButton, notGoingButton) {
  if (goingStatus === "going") {
    goingButton.className = "button button-selected";
    notGoingButton.className = "button";
  } else if (goingStatus === "not-going") {
    goingButton.className = "button";
    notGoingButton.className = "button button-selected";
  } else {
    goingButton.className = "button";
    notGoingButton.className = "button";
  }
}

/** Adds or removes the user as a Going or Not Going attendee. */
function addRemoveAttendee(event, buttonClicked, goingButton, notGoingButton,
    goingAttendees, notGoingAttendees, undecidedAttendees) {
  const params = new URLSearchParams();
  params.append('eventId', event.eventId);
  if (buttonClicked === 'going') {
    fetch('/going-attendee', {
      method: 'POST', body: params
    }).then(() => {
      updateAttendeeCount(event, buttonClicked, goingButton, notGoingButton, 
          goingAttendees, notGoingAttendees, undecidedAttendees);
      switchRSVPButtonColor(event, buttonClicked, goingButton, notGoingButton);
    });
  } else {
    fetch('/not-going-attendee', {
      method: 'POST', body: params
    }).then(() => {
      updateAttendeeCount(event, buttonClicked, goingButton, notGoingButton, 
          goingAttendees, notGoingAttendees, undecidedAttendees);
      switchRSVPButtonColor(event, buttonClicked, goingButton, notGoingButton);
    });
  }
}

/** Changes the color of the RSVP buttons when the user clicks one. */
function switchRSVPButtonColor(event, buttonClicked, goingButton, notGoingButton) {
  if (buttonClicked === 'going') {
    if (goingButton.classList.contains('button-selected')) {
      goingButton.className = 'button';
    } else {
      goingButton.className = 'button button-selected';
    }
    notGoingButton.className = 'button';
  } else {
    if (notGoingButton.classList.contains('button-selected')) {
      notGoingButton.className = 'button';
    } else {
      notGoingButton.className = 'button button-selected';
    }
    goingButton.className = 'button';
  } 
  if (window.location.pathname === '/profile.html') {
    // Reload the page to move the event to the new appropriate profile section.
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


/** Checks and updates all the attendee counts when a user responds to an event. */
function updateAttendeeCount(event, buttonClicked, goingButton, notGoingButton, 
    goingAttendees, notGoingAttendees, undecidedAttendees) {
  if (buttonClicked === 'going') {
    if (goingButton.classList.contains('button-selected')) {
      // If the Going button is clicked when already selected, remove a count from Going
      // and add a count to Undecided.
      updateSingleAttendeeCount(goingAttendees, -1, ' Going');
      updateSingleAttendeeCount(undecidedAttendees, 1, ' Undecided');
    } else {
      // If the Going button is clicked when not selected, add a count to Going
      // and remove a count from either Not Going or Undecided.
      updateSingleAttendeeCount(goingAttendees, 1, ' Going');
      if (notGoingButton.classList.contains('button-selected')) {
        updateSingleAttendeeCount(notGoingAttendees, -1, ' Not Going');
      } else {
        updateSingleAttendeeCount(undecidedAttendees, -1, ' Undecided');
      }
    }
  } else {
    if (notGoingButton.classList.contains('button-selected')) {
      // If the Not Going button is clicked when already selected, remove a count from 
      // Not Going and add a count to Undecided.
      updateSingleAttendeeCount(notGoingAttendees, -1, ' Not Going');
      updateSingleAttendeeCount(undecidedAttendees, 1, ' Undecided');
    } else {
      // If the Not Going button is clicked when not selected, add a count to
      // Not Going and remove a count from either Going or Undecided.
      updateSingleAttendeeCount(notGoingAttendees, 1, ' Not Going');
      if (goingButton.classList.contains('button-selected')) {
        updateSingleAttendeeCount(goingAttendees, -1, ' Going');
      } else {
        updateSingleAttendeeCount(undecidedAttendees, -1, ' Undecided');
      }
    }
  }
}

/** Increments the specified attendee count by the specified amount. */
function updateSingleAttendeeCount(attendeeType, amount, label) {
  const currentText = attendeeType.innerText;
  const currentCount = parseInt(currentText.substr(0, currentText.indexOf(' ')));
  const newCount = currentCount + amount;
  attendeeType.innerText = newCount + label;
}

function storeEventThenEdit(event) {
  sessionStorage.setItem(CURRENT_EVENT, JSON.stringify(event));
  window.location.href = "CreateAnEvent.html?fillIn=yes&editing=yes";
}

function displayEventFormFilledIn() {
  var event = JSON.parse(sessionStorage.getItem(CURRENT_EVENT));
  document.getElementById("event-name").value = event.eventName;
  document.getElementById("start-date").value = event.startDate;
  document.getElementById("start-time").value = event.startTime;
  document.getElementById("end-date").value = event.endDate;
  document.getElementById("end-time").value = event.endTime;
  document.getElementById("location").value = event.location;
  document.getElementById("place-id").value = event.placeId;
  document.getElementById("event-details").value = event.eventDetails;
  document.getElementById("privacy").value = event.privacy;
  if (event.privacy === "attendees") {
    document.getElementById("attendees-wrap").style.display = "block";
    document.getElementById("invited-attendee-ID-list").style.display = "none";
    document.getElementById("invited-attendee-ID-list").value = event.invitedAttendees;
    let allUsers = new Array();
    invitedAttendees = event.invitedAttendees;
    displayAttendees = document.getElementById("display-invited-attendees");

    fetch('/user')
      .then(response => response.json())
      .then(users => {
        allUsers = users;
        
        for (let i = 1; i < invitedAttendees.length; i ++) {
          for (let j = 0; j < allUsers.length; j ++) {
            if (invitedAttendees[i] === allUsers[j].id) {
              const userDisplay = document.createElement('div');
              userDisplay.className = "user-display";
              appendInfo(allUsers[i], userDisplay);
            }
          }
        }
      });
  }

  submitButton = document.getElementById("event-button");
  submitButton.innerText = "Edit Event";
}
