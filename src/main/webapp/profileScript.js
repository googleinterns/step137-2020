const LOCAL_STORAGE_STATUS = 'loginStatus';
const LOCAL_STORAGE_ID = 'userId';
const LOCAL_STORAGE_NAME = 'userName';
const PROFILE_VIEWER_LOGOUT = 'logged-out';
const PROFILE_VIEWER_STRANGER = 'stranger';
const PROFILE_VIEWER_BUDDY = 'buddy';
const PROFILE_VIEWER_PERSONAL = 'personal';

/*
 * Displays the page's content as soon as the page is laoded.
 */
function profileOnload() {
  navbarLoginDisplay();
  displayProfileContent();
}

/*
 * Displays login options in the navbar based on the user's login status.
 */
function navbarLoginDisplay() {
  // Clear the login-specific elements previously displayed.
  const userNavbarSection = document.getElementById('user-navbar-section');
  userNavbarSection.innerHTML = '';

  fetch('/login').then(response => response.json()).then((json) => {
    localStorage.setItem('loginStatus', json['loginStatus']);
    if (json['loginStatus'].localeCompare('true') == 0) {
      // If the user is logged in, locally store their info, confirm they have a name, 
      // then add logout and profile buttons to the navbar.
      localStorage.setItem('userId', json['id']);
      const name = localStorage.getItem(LOCAL_STORAGE_NAME);
      if (name == null) {
        confirmUserName();
      } else {
        const personalProfileButton = document.createElement('p');
        personalProfileButton.classList.add('navbar-text');
        personalProfileButton.innerText = name;
        personalProfileButton.addEventListener('click', () => {
          visitProfile(json['id']);
        });
        const logoutButton = document.createElement('p');
        logoutButton.classList.add('navbar-text');
        logoutButton.innerText = 'Logout';
        logoutButton.addEventListener('click', () => {
          window.location.href = json['logoutUrl'];
        });
        userNavbarSection.appendChild(personalProfileButton);
        userNavbarSection.appendChild(logoutButton);
        }
    } else {
      // If the user is logged out, clear the locally stored user data 
      // and add a login button to the navbar.
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      const loginButton = document.createElement('p');
      loginButton.classList.add('navbar-text');
      loginButton.innerText = 'Login';
      loginButton.addEventListener('click', () => {
        sessionStorage.setItem('loadProfile', 'justLoggedIn');
        window.location.href = json['loginUrl'];
      });
      userNavbarSection.appendChild(loginButton);
    }
  });
}

/*
 * Checks whether the user does not yet have a display name.
 */
function confirmUserName(personalProfileButton) {
  fetch('/user-name').then(response => response.text()).then((name) => {
    if (name.localeCompare('\n') == 0) {
    // If the user has not yet set their name, display the form.
      showNameForm();
    } else {
      // If the user's name is not yet in local storage, store it.
      localStorage.setItem('userName', name);
    }
    profileOnload();
  });
}

/*
 * Redirects the site to the clicked user's profile.
 */
function visitProfile(userId) {
  sessionStorage.setItem('loadProfile', userId);
  window.location.href = 'profile.html';
}

/*
 * Displays the profile content of the requested user.
 */
function displayProfileContent() {
  let profileId = sessionStorage.getItem('loadProfile');
  if (profileId.localeCompare('justLoggedIn') == 0) {
    // If user just logged in, show personal profile.
    profileId = localStorage.getItem('userId');
    sessionStorage.setItem('loadProfile', profileId);
  }
  let loginStatus = localStorage.getItem(LOCAL_STORAGE_STATUS);
  let currentId = localStorage.getItem(LOCAL_STORAGE_ID);
  fetch('/user').then(response => response.json()).then((users) => {
    for (let i = 0; i < users.length; i ++) {
      if ((users[i].id).localeCompare(profileId) == 0) {
        if (loginStatus.localeCompare('false') == 0) {
          // Display profile to logged out user.
          displayBasicInfo(users[i], PROFILE_VIEWER_LOGOUT);
          displaySavedInterests(users[i], PROFILE_VIEWER_LOGOUT);
        }else if (profileId.localeCompare(currentId) == 0) {
          // Display personal profile.
          displayBasicInfo(users[i], PROFILE_VIEWER_PERSONAL);
          displayBuddies(users[i], PROFILE_VIEWER_PERSONAL);
          displaySavedInterests(users[i], PROFILE_VIEWER_PERSONAL);
        } else if (users[i].buddies.includes(currentId)) {
          // Display buddy's profile.
          displayBasicInfo(users[i], PROFILE_VIEWER_BUDDY);
          displayBuddies(users[i], PROFILE_VIEWER_BUDDY);
          displaySavedInterests(users[i], PROFILE_VIEWER_BUDDY);
        } else {
          // Display stranger's profile.
          displayBasicInfo(users[i], PROFILE_VIEWER_STRANGER);
          displayBuddies(users[i], PROFILE_VIEWER_STRANGER);
          displaySavedInterests(users[i], PROFILE_VIEWER_STRANGER);
        }
        break;
      }
    }
  });
}

/*
 * Displays basic info and options regarding the specified user.
 */
function displayBasicInfo(user, viewer) {
  const nameContainer = document.getElementById('name-container');
  nameContainer.innerHTML = '';

  const name = document.createElement('h1');
  name.innerText = user.name;
  nameContainer.appendChild(name);
  
  if (viewer === PROFILE_VIEWER_PERSONAL) {
    // Add an option for the current user to change their display name.
    const editNameButton = document.createElement('i');
    editNameButton.className = 'fa fa-edit';
    editNameButton.addEventListener('click', () => {
      showNameForm();
    });
    nameContainer.append(editNameButton);
  }
}

/*
 * Displays buddies and buddy options of the specified user.
 */
function displayBuddies(user, viewer) {
  const buddyContainer = document.getElementById('buddy-container');
  buddyContainer.innerHTML = '';

  if (viewer === PROFILE_VIEWER_PERSONAL) {
    // Add the user's personal buddies list.
    const buddiesHeading = document.createElement('h3');
    buddiesHeading.innerText = 'Your buddies:';
    buddyContainer.appendChild(buddiesHeading);
    displayBuddiesList(user, buddyContainer);
  } else if (viewer === PROFILE_VIEWER_BUDDY) {
    // Add a remove buddy option.
    const removeBuddyButton = document.createElement('button');
    removeBuddyButton.innerText = 'Remove buddy';
    removeBuddyButton.addEventListener('click', () => {
      removeBuddy(user);
    });
    buddyContainer.appendChild(removeBuddyButton);
    // Add the profile user's buddies list.
    const buddiesHeading = document.createElement('h3');
    buddiesHeading.innerText = user.name + '\'' + 's buddies:';
    buddyContainer.appendChild(buddiesHeading);
    displayBuddiesList(user, buddyContainer);
  } else if (viewer === PROFILE_VIEWER_STRANGER) {
    // Add an add buddy option. 
    const addBuddyButton = document.createElement('button');
    addBuddyButton.innerText = 'Add buddy';
    addBuddyButton.addEventListener('click', () => {
      addBuddy(user);
    });
    buddyContainer.appendChild(addBuddyButton);
  }
}

function displayBuddiesList(user, buddyContainer) {
  const buddiesList = document.createElement('div');
  const buddyIds = user.buddies;
  fetch('/user').then(response => response.json()).then((users) => {
    for (let i = 0; i < users.length; i ++) {
      if (buddyIds.includes(users[i].id)) {
        // If the user's ID is in the list of the profile user's buddies,
        // add their name (which links to their profile) to the page. 
        const buddyElement = document.createElement('p');
        buddyElement.innerText = users[i].name;
        buddyElement.addEventListener('click', () => {
          visitProfile(users[i].id);
        });
        buddiesList.appendChild(buddyElement);
      }
    }
  });
  buddyContainer.append(buddiesList);
}

/*
 * Displays the saved interests of the specified user.
 */
function displaySavedInterests(user, viewer) {
  const savedInterestsContainer = document.getElementById('interests-container');
  savedInterestsContainer.innerHTML = '';

  if (viewer === PROFILE_VIEWER_PERSONAL || viewer === PROFILE_VIEWER_BUDDY) {
    fetch('/interest').then(response => response.json()).then((interests) => {
      for (let i = 0; i < interests.length; i ++) {
        if (interests[i].interestedUsers.includes(user.id)) {
          savedInterestsContainer.appendChild(createInterest(interests[i]));
        }
      }
    });
  } else if (viewer === PROFILE_VIEWER_STRANGER || viewer === PROFILE_VIEWER_LOGOUT) {
    const interestMessage = document.createElement('p');
    interestMessage.innerText = 'You cannot see this user\'s saved interests.';
    savedInterestsContainer.appendChild(interestMessage);
  }
}

/*
 * Returns a newly created saved interest element to be displayed on the page.
 */
function createInterest(interest) {
  const interestName = document.createElement('h3');
  interestName.innerText = interest.locationName;
  interestName.addEventListener('click', () => {
    sessionStorage.setItem('currentLocationId', interest.placeId);
    window.location.href = 'map.html';
  });

  const interestElement = document.createElement('div');
  interestElement.append(interestName);
  return interestElement;
}

/*
 * Displays the events for which the specified user is on the attendees list.
 */
function displayAttendingEvents(user) {
  const eventsContainer = document.getElementById('events-container');
  eventsContainer.innerHTML = '';

  fetch('/events').then(response => response.json()).then((events) => {
    for (let i = 0; i < events.length; i ++) {
      if (events[i].rsvpAttendees.includes(user.id)) {
        eventsContainer.appendChild(createEvent(events[i]));
      }
    }
  });
}

/*
 * Returns a newly created event element to be displayed on the page.
 */
function createEvent(event) {
  const eventName = document.createElement('h3');
  eventName.innerText = event.eventName;
  const eventLocation = document.createElement('p');
  eventLocation.innerText = event.location;
  const eventDetails = document.createElement('p'); 
  eventDetails.innerText = event.eventDetails;

  const eventElement = document.createElement('div');
  eventElement.className =  "card";
  eventElement.append(eventName);
  eventElement.append(eventLocation);
  eventElement.append(eventDetails);
  console.log(event.placeId);
  eventElement.addEventListener('click', () => {
    sessionStorage.setItem('currentLocationId', event.placeId);
    window.location.href = 'map.html';
  });
  return eventElement;
}

/*
 * Removes the buddy connection between the current user and the specified user.
 */
function removeBuddy(user) {
  const params = new URLSearchParams();
  params.append('user', user.id);
  params.append('action', 'remove');
  fetch('/buddy', {
    method: 'POST', body: params
  }).then(displayProfileContent);
}

/*
 * Adds the buddy connection between the current user and the specified user.
 */
function addBuddy(user) {
  const params = new URLSearchParams();
  params.append('user', user.id);
  params.append('action', 'add');
  fetch('/buddy', {
    method: 'POST', body: params
  }).then(displayProfileContent);
}

/*
 * Presents the user with a form to change their display name.
 */
function showNameForm() {
  document.getElementById('name-form-container').style.display = 'block';
}
