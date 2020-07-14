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
    localStorage.setItem('loginStatus', json['loginStatus']);
    if (json['loginStatus'].localeCompare('true') == 0) {
      // If the user is logged in, locally store their info, confirm they have a name, 
      // then add logout and profile buttons to the navbar.
      localStorage.setItem('userId', json['id']);
      const personalProfileButton = document.createElement('p');
      personalProfileButton.classList.add('navbar-text');
      personalProfileButton.addEventListener('click', () => {
        visitProfile(json['id']);
      });
      const logoutButton = document.createElement('p');
      logoutButton.classList.add('navbar-text');
      logoutButton.innerText = 'Logout';
      logoutButton.addEventListener('click', () => {
        window.location.href = json['logoutUrl'];
      });
      confirmUserName(personalProfileButton);
      userNavbarSection.appendChild(personalProfileButton);
      userNavbarSection.appendChild(logoutButton);
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
      if (window.location.pathname.localeCompare('/profile.html') == 0) {
        displayProfileContent();
      }
    }
  });
}

/*
 * Checks whether the user does not yet have a display name.
 */
function confirmUserName(personalProfileButton) {
  const currentName = localStorage.getItem('userName');
  if (currentName == null) {
    const promise = fetch('/user-name').then(response => response.text()).then((name) => {
      if (name.localeCompare('\n') == 0) {
        // If the user has not yet set their name, display the form.
        showNameForm();
      } else {
        // If the user's name is not yet in local storage, store it and display the page.
        localStorage.setItem('userName', name);
        personalProfileButton.innerText = name;
        if (window.location.pathname.localeCompare('/profile.html') == 0) {
          displayProfileContent();
        }
      }
    });
  } else {
    // If the user's name is in local storage, display the page.
    personalProfileButton.innerText = currentName;
    if (window.location.pathname.localeCompare('/profile.html') == 0) {
      displayProfileContent();
    }
  }
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
  let id = sessionStorage.getItem('loadProfile');
  if (id.localeCompare('justLoggedIn') == 0) {
    // If just logged in, show personal profile.
    id = localStorage.getItem('userId');
    sessionStorage.setItem('loadProfile', id);
  }
  fetch('/user').then(response => response.json()).then((users) => {
    for (let i = 0; i < users.length; i ++) {
      if ((users[i].id).localeCompare(id) == 0) {
        displayBasicInfo(users[i]);
        displaySavedInterests(users[i]);
        displayAttendingEvents(users[i]);
        additionalDisplay(users[i]);
        break;
      }
    }
  });
}

/*
 * Displays the basic info of the specified user.
 */
function displayBasicInfo(user) {
  const nameContainer = document.getElementById('name-container');
  nameContainer.innerHTML = '';

  const name = document.createElement('h1');
  name.innerText = user.name;
  name.style = 'padding-left: 10px';
  nameContainer.appendChild(name);
}

/*
 * Displays the saved interests of the specified user.
 */
function displaySavedInterests(user) {
  const savedInterestsContainer = document.getElementById('interests-container');
  savedInterestsContainer.innerHTML = '';

  fetch('/interest').then(response => response.json()).then((interests) => {
    for (let i = 0; i < interests.length; i ++) {
      if (interests[i].interestedUsers.includes(user.id)) {
        savedInterestsContainer.appendChild(createInterest(interests[i]));
      }
    }
  });
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
      if (events[i].rsvpAttendees.includes(user.id) || events[i].invitedAttendees.includes(user.id)) {
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
  return eventElement;
}

/*
 * Displays additional information and options for the user 
 * based on whose profile they are viewing.
 */
function additionalDisplay(user) {
  if (localStorage.getItem('loginStatus').localeCompare('true') == 0) {
    if (localStorage.getItem('userId').localeCompare(user.id) == 0) {
      personalDisplay();
    } else {
      fetch('/buddy').then(response => response.json()).then((buddies) => {
        if (buddies.includes(user.id)) {
          buddyDisplay(user);
        } else {
          strangerDisplay(user);
        }
      });
    }
  }
}

/*
 * Displays information and options for if the user is viewing their own profile.
 */
function personalDisplay() {
  // Add an option for the current user to change their display name.
  const editNameButton = document.createElement('i');
  editNameButton.className = 'fa fa-edit';
  editNameButton.addEventListener('click', () => {
    showNameForm();
  });

  // Add the list of the current user's buddies.
  const buddiesList = document.createElement('div');
  const buddiesHeading = document.createElement('h3');
  buddiesHeading.innerText = 'Your buddies:';
  buddiesList.appendChild(buddiesHeading);
  fetch('/buddy').then(response => response.json()).then((buddies) => {
    fetch('/user').then(response => response.json()).then((users) => {
      for (let i = 0; i < users.length; i ++) {
        if (buddies.includes(users[i].id)) {
          // If the user's ID is in the list of the current user's buddies,
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
  });

  const nameContainer = document.getElementById('name-container');
  nameContainer.appendChild(editNameButton);
  const buddyContainer = document.getElementById('buddy-container');
  buddyContainer.innerHTML = '';
  buddyContainer.appendChild(buddiesList);
}

/*
 * Displays information and options for if the user is viewing a buddy's profile.
 */
function buddyDisplay(user) {
  // Add an option for the current user to remove this user as their buddy.
  const removeBuddyButton = document.createElement('button');
  removeBuddyButton.innerText = 'Remove buddy';
  removeBuddyButton.addEventListener('click', () => {
    removeBuddy(user);
    profileOnload();
  });

  const buddyContainer = document.getElementById('buddy-container');
  buddyContainer.innerHTML = '';
  buddyContainer.appendChild(removeBuddyButton);
}

/*
 * Displays information and options for if the user is viewing a stranger's profile.
 */
function strangerDisplay(user) {
  // Add an option for the current user to add this user as their buddy.
  const addBuddyButton = document.createElement('button');
  addBuddyButton.innerText = 'Add buddy';
  addBuddyButton.addEventListener('click', () => {
    addBuddy(user);
    profileOnload();
  });

  const buddyContainer = document.getElementById('buddy-container');
  buddyContainer.innerHTML = '';
  buddyContainer.appendChild(addBuddyButton);
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
  });
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
  });
}

/*
 * Presents the user with a form to change their display name.
 */
function showNameForm() {
  document.getElementById('name-form-container').style.display = 'block';
}
