// Global Variables
const LOCAL_STORAGE_STATUS = 'loginStatus';
const LOCAL_STORAGE_ID = 'userId';
const LOCAL_STORAGE_NAME = 'userName';
const PROFILE_VIEWER_LOGOUT = 'logged-out';
const PROFILE_VIEWER_STRANGER = 'stranger';
const PROFILE_VIEWER_BUDDY = 'buddy';
const PROFILE_VIEWER_PERSONAL = 'personal';
const SESSION_STORAGE_PROFILE = 'loadProfile';
const SESSION_STORAGE_CURRENT_LOCATION = 'currentLocationId';

/*
 * Displays the page's content as soon as the page is laoded.
 */
function profileOnload() {
  navbarLoginDisplay();
}

/*
 * Displays login options in the navbar based on the user's login status.
 */
function navbarLoginDisplay() {
  // Clear the login-specific elements previously displayed.
  const userNavbarSection = document.getElementById('user-navbar-section');
  userNavbarSection.innerHTML = '';

  fetch('/login').then(response => response.json()).then((json) => {
    localStorage.setItem(LOCAL_STORAGE_STATUS, json['loginStatus']);
    if (json['loginStatus'] === 'true') {
      // If the user is logged in, locally store their info, confirm they have a name, 
      // then add logout and profile buttons to the navbar.
      localStorage.setItem(LOCAL_STORAGE_ID, json['id']);
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
      localStorage.removeItem(LOCAL_STORAGE_ID);
      localStorage.removeItem(LOCAL_STORAGE_NAME);
      const loginButton = document.createElement('p');
      loginButton.classList.add('navbar-text');
      loginButton.innerText = 'Login';
      loginButton.addEventListener('click', () => {
        sessionStorage.setItem(SESSION_STORAGE_PROFILE, 'justLoggedIn');
        window.location.href = json['loginUrl'];
      });
      userNavbarSection.appendChild(loginButton);
    }
  }).then(() => {
    if (window.location.pathname.localeCompare('/profile.html') == 0) {
      displayProfile();
    } 
  });
}

/*
 * Checks whether the user does not yet have a display name.
 */
function confirmUserName(personalProfileButton) {
  fetch('/user-name').then(response => response.text()).then((name) => {
    if (name === '\n') {
    // If the user has not yet set their name, display the form.
      showNameForm();
    } else {
      // If the user's name is not yet in local storage, store it.
      localStorage.setItem(LOCAL_STORAGE_NAME, name);
    }
    profileOnload();
  });
}

/*
 * Redirects the site to the clicked user's profile.
 */
function visitProfile(userId) {
  sessionStorage.setItem(SESSION_STORAGE_PROFILE, userId);
  window.location.href = 'profile.html';
}

/*
 * Displays the profile of the requested user.
 */
function displayProfile() {
  let profileId = sessionStorage.getItem(SESSION_STORAGE_PROFILE);
  if (profileId === 'justLoggedIn') {
    // If user just logged in, show personal profile.
    profileId = localStorage.getItem(LOCAL_STORAGE_ID);
    sessionStorage.setItem(SESSION_STORAGE_PROFILE, profileId);
  }
  let loginStatus = localStorage.getItem(LOCAL_STORAGE_STATUS);
  let currentId = localStorage.getItem(LOCAL_STORAGE_ID);
  fetch('/user').then(response => response.json()).then((users) => {
    for (let i = 0; i < users.length; i ++) {
      if ((users[i].id) === profileId) {
        if (loginStatus === 'false') {
          // Display profile to logged out user.
          displayContent(users[i], PROFILE_VIEWER_LOGOUT);
        }else if (profileId === currentId) {
          // Display personal profile.
          displayContent(users[i], PROFILE_VIEWER_PERSONAL);
        } else if (users[i].buddies.includes(currentId)) {
          // Display buddy's profile.
          displayContent(users[i], PROFILE_VIEWER_BUDDY);
        } else {
          // Display stranger's profile.
          displayContent(users[i], PROFILE_VIEWER_STRANGER);
        }
        break;
      }
    }
  });
}

/*
 * Displays the user's profile content based on the viewer.
 */
function displayContent(user, viewer) {
  displayBasicInfo(user, viewer);
  displayBuddies(user, viewer);
  displaySavedInterests(user, viewer);
  displayEvents(user, viewer);
  displayPosts(user, viewer);
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

/*
 * Display the buddies list of the specified user.
 */
function displayBuddiesList(user, buddyContainer) {
  const buddiesList = document.createElement('div');
  const buddyIds = user.buddies;
  if (buddyIds.length == 1) { // length of 1 due to empty placeholder
    const buddyMessage = document.createElement('p');
    buddyMessage.innerText = 'No buddies to show.';
    buddyContainer.append(buddyMessage);
  } else {
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
  }
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
      let interestCount = 0;
      for (let i = 0; i < interests.length; i ++) {
        if (interests[i].interestedUsers.includes(user.id)) {
          savedInterestsContainer.appendChild(createInterest(interests[i]));
          interestCount ++;
        }
      }
      if (interestCount == 0) {
        const interestMessage = document.createElement('p');
        interestMessage.innerText = 'No interests to show.';
        savedInterestsContainer.appendChild(interestMessage);
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
    sessionStorage.setItem(SESSION_STORAGE_CURRENT_LOCATION, interest.placeId);
    window.location.href = 'map.html';
  });

  const interestElement = document.createElement('div');
  interestElement.append(interestName);
  return interestElement;
}

/*
 * Displays the events of the specified user.
 */
function displayEvents(user, viewer) {
  const eventsContainer = document.getElementById('events-container');
  eventsContainer.innerHTML = '';

  if (viewer === PROFILE_VIEWER_PERSONAL) {
    // Display events the user is invited to or attending.
    fetch('/events').then(response => response.json()).then((events) => {
      let eventsCount = 0;
      for (let i = 0; i < events.length; i ++) {
        if (events[i].rsvpAttendees.includes(user.id) || 
            events[i].invitedAttendees.includes(user.id)) {
          eventsContainer.appendChild(createEvent(events[i]));
          eventsCount ++;
        }
      }
      if (eventsCount == 0) {
        const eventMessage = document.createElement('p');
        eventMessage.innerText = 'No events to show.';
        eventsContainer.appendChild(eventMessage);
      }
    });
  } else if (viewer === PROFILE_VIEWER_BUDDY) {
    // Display events the user is invited to or attending and
    // the current user has access to.
    const currentId = localStorage.getItem(LOCAL_STORAGE_ID);
    fetch('/events').then(response => response.json()).then((events) => {
      let eventsCount = 0;
      for (let i = 0; i < events.length; i ++) {
        if (events[i].rsvpAttendees.includes(user.id) || 
            events[i].invitedAttendees.includes(user.id)) {
          if (events[i].rsvpAttendees.includes(currentId) || 
              events[i].invitedAttendees.includes(currentId) || 
                  events[i].privacy === 'public') {
            eventsContainer.appendChild(createEvent(events[i]));
            eventsCount ++;
          }
        }
      }
      if (eventsCount == 0) {
        const eventMessage = document.createElement('p');
        eventMessage.innerText = 'No events to show.';
        eventsContainer.appendChild(eventMessage);
      }
    });
  } else if (viewer === PROFILE_VIEWER_STRANGER || viewer === PROFILE_VIEWER_LOGOUT) {
    const eventMessage = document.createElement('p');
    eventMessage.innerText = 'You cannot see this user\'s events.';
    eventsContainer.appendChild(eventMessage);
  }
}

/*
 * Returns a newly created event element to be displayed on the page.
 */
function createEvent(event) {
  const eventName = document.createElement('h2');
  eventName.id = "name-display";
  eventName.innerText = event.eventName;

  const eventDate = document.createElement('p');
  eventDate.id = "date-display";
  eventDate.innerText = event.dateTime;

  const eventLocation = document.createElement('p');
  eventName.id = "location-display";
  eventLocation.innerText = event.location;

  const eventDetails = document.createElement('p'); 
  eventDetails.id = "details-display";
  eventDetails.innerText = event.eventDetails;

  const eventElement = document.createElement('div');
  eventElement.className = "card";
  const eventContents = document.createElement('div');
  eventContents.className = "contents";
  eventContents.append(eventName);
  eventContents.append(eventDate);
  eventContents.append(eventLocation);
  eventContents.append(eventDetails);
  eventElement.append(eventContents);
  eventElement.addEventListener('click', () => {
  sessionStorage.setItem(SESSION_STORAGE_CURRENT_LOCATION, event.placeId);
    window.location.href = 'map.html';
  });
  return eventElement;
}

/*
 * Displays the posts of the specified user.
 */
function displayPosts(user, viewer) {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = '';

  if (viewer === PROFILE_VIEWER_PERSONAL || viewer === PROFILE_VIEWER_BUDDY) {
    const postMessage = document.createElement('p');
    postMessage.innerText = 'No posts to show.';
    postsContainer.appendChild(postMessage);
  } else if (viewer === PROFILE_VIEWER_STRANGER || viewer === PROFILE_VIEWER_LOGOUT) {
    const postMessage = document.createElement('p');
    postMessage.innerText = 'You cannot see this user\'s posts.';
    postsContainer.appendChild(postMessage);
  }
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
  }).then(displayProfile);
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
  }).then(displayProfile);
}

/*
 * Presents the user with a form to change their display name.
 */
function showNameForm() {
  document.getElementById('name-form-container').style.display = 'block';
}
