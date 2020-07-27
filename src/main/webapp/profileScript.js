// Global Variables
const LOCAL_STORAGE_STATUS = 'loginStatus';
const LOCAL_STORAGE_ID = 'userId';
const LOCAL_STORAGE_NAME = 'userName';
const PROFILE_VIEWER_LOGOUT = 'logged-out';
const PROFILE_VIEWER_STRANGER = 'stranger';
const PROFILE_VIEWER_BUDDY = 'buddy';
const PROFILE_VIEWER_PERSONAL = 'personal';
const PROFILE_VIEWER_PENDING_BUDDY = 'pending-buddy';
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
      if (name == null || name === '') {
        confirmUserName();
      } else {
        fetch('/user').then(response => response.json()).then((users) => {
          for (let i = 0; i < users.length; i ++) {
            if ((users[i].id) === json['id']) {
              displayProfilePicture(users[i], userNavbarSection, 'profile-pic-small');
              const personalProfileButton = document.createElement('p');
              personalProfileButton.className = 'navbar-text';
              personalProfileButton.style = 'padding-left: 3px';
              personalProfileButton.innerText = name;
              personalProfileButton.addEventListener('click', () => {
                visitProfile(json['id']);
              });
              userNavbarSection.appendChild(personalProfileButton);
              break;
            }
          }
          const logoutButton = document.createElement('p');
          logoutButton.className = 'navbar-text';
          logoutButton.innerText = 'Logout';
          logoutButton.addEventListener('click', () => {
            window.location.href = json['logoutUrl'];
          });
          userNavbarSection.appendChild(logoutButton);
        });
      }
    } else {
      // If the user is logged out, clear the locally stored user data 
      // and add a login button to the navbar.
      localStorage.removeItem(LOCAL_STORAGE_ID);
      localStorage.removeItem(LOCAL_STORAGE_NAME);
      const loginButton = document.createElement('p');
      loginButton.className = 'navbar-text';
      loginButton.innerText = 'Login';
      loginButton.addEventListener('click', () => {
        sessionStorage.setItem(SESSION_STORAGE_PROFILE, 'justLoggedIn');
        window.location.href = json['loginUrl'];
      });
      userNavbarSection.appendChild(loginButton);
    }
  }).then(() => {
    if (window.location.pathname === '/profile.html') {
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
      showNameForm('set');
    } else {
      // If the user's name is not yet in local storage, store it.
      localStorage.setItem(LOCAL_STORAGE_NAME, name);
      profileOnload();
    }
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
        } else if (users[i].buddyRequests.includes(currentId)) {
          // Display pending buddy's profile.
          displayContent(users[i], PROFILE_VIEWER_PENDING_BUDDY);
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
  displayEventsAndPosts(user, viewer);
}

/*
 * Displays basic info and options regarding the specified user.
 */
function displayBasicInfo(user, viewer) {
  const profilePicContainer = document.getElementById('profile-pic-container');
  displayProfilePicture(user, profilePicContainer, 'profile-pic-large');

  const editImageButton = document.createElement('i');
  editImageButton.id = 'edit-image-button';
  editImageButton.className = 'fa fa-edit';

  const nameContainer = document.getElementById('name-container');
  nameContainer.innerHTML = '';

  const name = document.createElement('h1');
  name.innerText = user.name;
  
  const editNameButton = document.createElement('i');
  editNameButton.id = 'edit-name-button';
  editNameButton.className = 'fa fa-edit';

  if (viewer === PROFILE_VIEWER_PERSONAL) {
    // On hover, display an option for the current user to change their name.
    name.id = 'personal-name';
    nameContainer.addEventListener('click', () => {
      showNameForm('change');
    });
    
    // On hover, display an option for the current user to change their profile picture.
    profilePicContainer.className = 'personal-pic-container'
    profilePicContainer.addEventListener('click', () => {
      showImageForm();
    });
    const personalPic = profilePicContainer.childNodes[0];
    personalPic.id = 'personal-pic';
  }
  profilePicContainer.appendChild(editImageButton);
  nameContainer.appendChild(name);
  nameContainer.appendChild(editNameButton);
}

/**
 * Displays the profile picture of the specified user.
 */
function displayProfilePicture(user, container, size) {
  container.innerHTML = '';

  const profilePic = document.createElement('img');
  profilePic.className = size;

  if (user.blobKeyString === '') {
    profilePic.src = '/images/default-profile-picture.jpg';
  } else {
    const params = new URLSearchParams();
    params.append('blobkey', Object.values(user.blobKey));
    fetch('/serve', {
      method: 'POST', body: params
    }).then(response => response.blob()).then(function(image) {
      var imageURL = URL.createObjectURL(image);
      profilePic.src = imageURL;
    });
  }
  container.appendChild(profilePic);
}

/**
 * Creates and returns an element representing a user.
 */
function createUserElement(user) {
  const userElement = document.createElement('div');
  userElement.className = 'user-element';
  displayProfilePicture(user, userElement, 'profile-pic-small');
  const userName = document.createElement('p');
  userName.innerText = user.name;
  userElement.appendChild(userName);
  userElement.addEventListener('click', () => {
    visitProfile(user.id);
  });
  return userElement;
}

/*
 * Displays buddies and buddy options of the specified user.
 */
function displayBuddies(user, viewer) {
  const buddyContainer = document.getElementById('buddy-container');
  buddyContainer.innerHTML = '';

  if (viewer === PROFILE_VIEWER_PERSONAL) {
    // Add a popup for the user's buddy requests.
    const requestHeading = document.createElement('h3');
    const numBuddyRequests = user.buddyRequests.length - 1;
    if (numBuddyRequests == 1) {
      requestHeading.innerText = numBuddyRequests + ' buddy request';  
    } else {
      requestHeading.innerText = numBuddyRequests + ' buddy requests';
    }
    requestHeading.addEventListener('click', () => {
      displayBuddyRequests(user);
    });
    if (document.getElementById('requests-popup').style.display === 'block') {
      displayBuddyRequests(user);
    }
    buddyContainer.appendChild(requestHeading);
    // Add a popup for the user's buddies list.
    const buddiesHeading = document.createElement('h3');
    const numBuddies = user.buddies.length - 1;
    if (numBuddies == 1) {
      buddiesHeading.innerText = numBuddies + ' buddy';
    } else {
      buddiesHeading.innerText = numBuddies + ' buddies';
    }
    buddiesHeading.addEventListener('click', () => {
      displayBuddiesList(user);
    });
    if (document.getElementById('buddies-popup').style.display === 'block') {
      displayBuddiesList(user);
    }
    buddyContainer.appendChild(buddiesHeading);
  } else if (viewer === PROFILE_VIEWER_BUDDY) {
    // Add a popup for the profile user's buddies list.
    const buddiesHeading = document.createElement('h3');
    const numBuddies = user.buddies.length - 1;
    if (numBuddies == 1) {
      buddiesHeading.innerText = numBuddies + ' buddy';
    } else {
      buddiesHeading.innerText = numBuddies + ' buddies';
    }
    buddiesHeading.addEventListener('click', () => {
      displayBuddiesList(user);
    });
    if (document.getElementById('buddies-popup').style.display === 'block') {
      displayBuddiesList(user);
    }
    buddyContainer.appendChild(buddiesHeading);
    // Add a remove buddy option.
    const removeBuddyButton = document.createElement('button');
    removeBuddyButton.className = 'button';
    removeBuddyButton.innerText = 'Remove buddy';
    removeBuddyButton.addEventListener('click', () => {
      addOrRemoveBuddy(user, 'remove');
    });
    buddyContainer.appendChild(removeBuddyButton);
  } else if (viewer === PROFILE_VIEWER_PENDING_BUDDY) {
    // Add an option informing the user that a buddy request has been sent.
    const requestSentButton = document.createElement('button');
    requestSentButton.className = 'button';
    requestSentButton.innerText = 'Buddy request sent';
    requestSentButton.addEventListener('click', () => {
      sendOrRemoveBuddyRequest(user, 'unsend');
    });
    buddyContainer.appendChild(requestSentButton);
  } else if (viewer === PROFILE_VIEWER_STRANGER) {
    // Add an add buddy option. 
    const addBuddyButton = document.createElement('button');
    addBuddyButton.className = 'button';
    addBuddyButton.innerText = 'Add buddy';
    addBuddyButton.addEventListener('click', () => {
      sendOrRemoveBuddyRequest(user, 'send');
    });
    buddyContainer.appendChild(addBuddyButton);
  }
}

/*
 * Displays the buddy requests of the specified user.
 */
function displayBuddyRequests(user) {
  // Create an empty popup with a heading and an exit button.
  const requestsPopup = document.getElementById('requests-popup');
  requestsPopup.innerHTML = '';
  const buddyRequests = document.createElement('div');
  buddyRequests.className = 'popup-text';
  const buddyRequestsHeading = document.createElement('h3');
  buddyRequestsHeading.innerText = 'Buddy Requests';
  const exitButton = document.createElement('i');
  exitButton.className = 'fa fa-close';
  exitButton.addEventListener('click', () => {
    requestsPopup.style.display = 'none';
  });
  buddyRequests.appendChild(buddyRequestsHeading)
  buddyRequests.appendChild(exitButton);

  const requestIds = user.buddyRequests;
  if (requestIds.length == 1) { // length of 1 due to empty placeholder
    const requestMessage = document.createElement('p');
    requestMessage.innerText = 'No buddy requests to show.';
    buddyRequests.appendChild(requestMessage);
    requestsPopup.appendChild(buddyRequests);
  } else {
    fetch('/user').then(response => response.json()).then((users) => {
      for (let i = 0; i < users.length; i ++) {
        if (requestIds.includes(users[i].id)) {
          // If the user's ID is in the list of the profile user's buddy requests,
          // add a request element (which includes the user's clickable name 
          // and image, an approve button, and a remove button) to the page.
          const requestElement = document.createElement('div');
          requestElement.className = 'request-element';
          const requestButtons = document.createElement('div');
          requestButtons.className = 'request-buttons';
          const approveButton = document.createElement('button');
          approveButton.className = 'request-button';
          approveButton.innerText = 'Approve';
          approveButton.addEventListener('click', () => {
            addOrRemoveBuddy(users[i], 'add');
          });
          const removeButton = document.createElement('button');
          removeButton.className = 'request-button';
          removeButton.innerText = 'Remove';
          removeButton.addEventListener('click', () => {
            sendOrRemoveBuddyRequest(users[i], 'remove');
          });
          requestButtons.appendChild(approveButton);
          requestButtons.appendChild(removeButton);
          requestElement.appendChild(createUserElement(users[i]));
          requestElement.appendChild(requestButtons);
          buddyRequests.appendChild(requestElement);
        }
      }
    }).then(() => {
      requestsPopup.appendChild(buddyRequests);
    });
  }
  requestsPopup.style.display = 'block';
}

/*
 * Displays the buddies list of the specified user.
 */
function displayBuddiesList(user, buddyContainer) {
  // Create an empty popup with a heading and an exit button.
  const buddiesPopup = document.getElementById('buddies-popup');
  buddiesPopup.innerHTML = '';
  const buddiesList = document.createElement('div');
  buddiesList.className = 'popup-text';
  const buddiesHeading = document.createElement('h3');
  buddiesHeading.innerText = 'Buddies';
  const exitButton = document.createElement('i');
  exitButton.className = 'fa fa-close';
  exitButton.addEventListener('click', () => {
    buddiesPopup.style.display = 'none';
  });
  buddiesList.appendChild(buddiesHeading);
  buddiesList.appendChild(exitButton);

  const buddyIds = user.buddies;
  if (buddyIds.length == 1) { // length of 1 due to empty placeholder
    const buddyMessage = document.createElement('p');
    buddyMessage.innerText = 'No buddies to show.';
    buddiesList.appendChild(buddyMessage);
    buddiesPopup.appendChild(buddiesList);
  } else {
    fetch('/user').then(response => response.json()).then((users) => {
      for (let i = 0; i < users.length; i ++) {
        if (buddyIds.includes(users[i].id)) {
          // If the user's ID is in the list of the profile user's buddies,
          // add their clickable name and image to the page. 
          buddiesList.appendChild(createUserElement(users[i]));
        }
      }
    }).then(() => {
      buddiesPopup.appendChild(buddiesList);
    });
  }
  buddiesPopup.style.display = 'block';
}

/*
 * Displays the saved interests of the specified user.
 */
function displaySavedInterests(user, viewer) {
  const savedInterestsContainer = document.getElementById('interests-container');
  savedInterestsContainer.innerHTML = '';

  const interestHeading = document.createElement('h1');
  interestHeading.style = 'text-align: center';
  interestHeading.innerText = 'Saved Interests';
  savedInterestsContainer.appendChild(interestHeading);

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
  } else if (viewer === PROFILE_VIEWER_STRANGER || viewer === PROFILE_VIEWER_LOGOUT 
      || viewer === PROFILE_VIEWER_PENDING_BUDDY) {
    const interestMessage = document.createElement('p');
    interestMessage.innerText = 'You cannot see this user\'s saved interests.';
    savedInterestsContainer.appendChild(interestMessage);
  }
}

/*
 * Returns a newly created saved interest element to be displayed on the page.
 */
function createInterest(interest) {
  const interestIcon = document.createElement('img');
  interestIcon.id = 'interest-icon';
  interestIcon.src = 'images/red-marker.png';

  const interestName = document.createElement('h4');
  interestName.innerText = interest.locationName;
  interestName.addEventListener('click', () => {
    sessionStorage.setItem(SESSION_STORAGE_CURRENT_LOCATION, interest.placeId);
    window.location.href = 'map.html';
  });

  const interestElement = document.createElement('div');
  interestElement.id = 'interest-element';
  interestElement.append(interestIcon);
  interestElement.append(interestName);
  return interestElement;
}

/*
 * Displays the events of the specified user.
 */
function displayEventsAndPosts(user, viewer) {
  const eventsAndPostsContainer = document.getElementById('events-and-posts-container');
  eventsAndPostsContainer.innerHTML = '';

  const eventsContainer = document.createElement('div');
  eventsContainer.className = 'tabcontent';
  eventsContainer.id = 'events-container';
  const postsContainer = document.createElement('div');
  postsContainer.className = 'tabcontent';
  postsContainer.id = 'posts-container';
  const tabContainer = createEventsPostsTab();

  if (viewer === PROFILE_VIEWER_PERSONAL) {
    displayPersonalEvents(user, eventsContainer);
  } else if (viewer === PROFILE_VIEWER_BUDDY) {
    displayBuddyEvents(user, eventsContainer);
  } else if (viewer === PROFILE_VIEWER_STRANGER || viewer === PROFILE_VIEWER_LOGOUT 
      || viewer === PROFILE_VIEWER_PENDING_BUDDY) {
    const eventMessage = document.createElement('p');
    eventMessage.innerText = 'You cannot see this user\'s events.';
    eventsContainer.appendChild(eventMessage);
  }
  displayPosts(user, viewer, postsContainer);
  eventsAndPostsContainer.append(tabContainer);
  eventsAndPostsContainer.append(eventsContainer);
  eventsAndPostsContainer.append(postsContainer);
  document.getElementById('open').click();
}

/*
 * Displays events the user is invited to or attending on their personal profile.
 */
function displayPersonalEvents(user, eventsContainer) {
  // Create a dropdown to select between invited and attending events.
  const dropDownContainer = document.createElement('div');
  dropDownContainer.id = 'dropdown-container';
  const dropDown = document.createElement('select');
  const attendingOption = document.createElement('option');
  attendingOption.innerText = 'Attending';
  const invitedOption = document.createElement('option');
  invitedOption.innerText = 'Invited';
  
  const attendingEvents = document.createElement('div');
  attendingEvents.id = 'attending-events';
  const invitedEvents = document.createElement('div');
  invitedEvents.id = 'invited-events';
  
  dropDown.onchange = () => {
    if (invitedEvents.style.display === 'flex') {
      invitedEvents.style.display = 'none';
      attendingEvents.style.display = 'flex';
    } else {
      attendingEvents.style.display = 'none';
      invitedEvents.style.display = 'flex';
    }
  };
  dropDown.appendChild(attendingOption);
  dropDown.appendChild(invitedOption);
  dropDownContainer.appendChild(dropDown);

  fetch('/events').then(response => response.json()).then((events) => {
    let invitedEventsCount = 0;
    let attendingEventsCount = 0;
    for (let i = 0; i < events.length; i ++) {
      if (events[i].rsvpAttendees.includes(user.id)) {
        attendingEvents.appendChild(createEventWithResponse(events[i], user.id, "true"));
        attendingEventsCount ++;
      } else if (events[i].invitedAttendees.includes(user.id)) {
        invitedEvents.appendChild(createEventWithResponse(events[i], user.id, "false"));
        invitedEventsCount ++;
      }
    }
    if (attendingEventsCount == 0) {
      const attendingEventMessage = document.createElement('p');
      attendingEventMessage.innerText = 'No attending events to show.';
      attendingEvents.appendChild(attendingEventMessage);
    }
    if (invitedEventsCount == 0) {
      const invitedEventMessage = document.createElement('p');
      invitedEventMessage.innerText = 'No invited events to show.';
      invitedEvents.appendChild(invitedEventMessage);
    }
    eventsContainer.append(dropDownContainer);
    eventsContainer.append(attendingEvents);
    eventsContainer.append(invitedEvents);
  });
}

/*
 * Displays events on a buddy's profile that they are attending and the current
 * user can also view.
 */
function displayBuddyEvents(user, eventsContainer) {
  const currentId = localStorage.getItem(LOCAL_STORAGE_ID);
  fetch('/events').then(response => response.json()).then((events) => {
    let eventsCount = 0;
    for (let i = 0; i < events.length; i ++) {
      if (events[i].rsvpAttendees.includes(user.id)) {
        if (events[i].rsvpAttendees.includes(currentId) || 
            events[i].invitedAttendees.includes(currentId) || 
                events[i].privacy === 'public') {
          eventsContainer.appendChild(createEventNoResponse(events[i]));
          eventsCount ++;
        }
      }
    }
  });
}

/*
 * Creates the tab element that hold the events and posts tabs.
 */
function createEventsPostsTab() {
  const tabContainer = document.createElement('div');
  tabContainer.className = 'tab';
  tabContainer.innerHTML = '';

  const eventsButton = document.createElement('button');
  eventsButton.innerText = 'Events';
  eventsButton.className = 'tablinks active';
  eventsButton.id = 'open';
  eventsButton.addEventListener('click', function(e) {
    openTab(e, 'events-container');
  })

  const postsButton = document.createElement('button');
  postsButton.innerText = 'Posts';
  postsButton.className = 'tablinks';
  postsButton.addEventListener('click', function(e) {
    openTab(e, 'posts-container');
  })

  tabContainer.appendChild(eventsButton);
  tabContainer.appendChild(postsButton);
  return tabContainer;
}

/*
 * Displays the posts of the specified user.
 */
function displayPosts(user, viewer, postsContainer) {
  let count = 0; 
  const currentId = localStorage.getItem(LOCAL_STORAGE_ID);
  const postsGrid = document.createElement('div');
  postsGrid.id = 'posts-grid';

  fetch('/post')
    .then(response => response.json())
    .then(posts => {
      if (viewer === PROFILE_VIEWER_PERSONAL) {
        for (let i = 0; i < posts.length; i ++) {
          if (posts[i].creator === user.id) {
            postsGrid.appendChild(createPostWithResponse(posts[i], currentId));
            count++;
          }
        }
      } else if (viewer === PROFILE_VIEWER_BUDDY) {
        for (let i = 0; i < posts.length; i ++) {
          if (posts[i].creator === user.id) {
            if (posts[i].privacy === "public" 
                || posts[i].privacy === "buddies-only") {
              postsGrid.appendChild(createPostWithResponse(posts[i], currentId));
              count++
            }
          }
        }
      } else if (viewer === PROFILE_VIEWER_STRANGER || viewer === PROFILE_VIEWER_LOGOUT
          || viewer === PROFILE_VIEWER_PENDING_BUDDY) {
        for (let i = 0; i < posts.length; i ++) {
          if (posts[i].creator === currentId) {
            if (posts[i].privacy == "public") {
              postsGrid.appendChild(createPostWithResponse(posts[i], user.id));
              count++
            }
          }
        }
      }
      if (count === 0) {
        noPostElement = document.createElement('p');
        noPostElement.innerText = "No posts to show.";
        postsGrid.appendChild(noPostElement);
      }
      postsContainer.appendChild(postsGrid);
    });
}

/*
 * Adds or removes a buddy connection between the current user and the specified user.
 */
function addOrRemoveBuddy(user, action) {
  const params = new URLSearchParams();
  params.append('user', user.id);
  params.append('action', action);
  fetch('/buddy', {
    method: 'POST', body: params
  }).then(displayProfile);
}

/*
 * Sends or a buddy request from the current user to the specified user or 
 * removes a buddy request to the current user from the specified user.
 */
function sendOrRemoveBuddyRequest(user, action) {
  const params = new URLSearchParams();
  params.append('user', user.id);
  params.append('action', action);
  fetch('buddy-request', {
    method: 'POST', body: params
  }).then(displayProfile);
}

/*
 * Presents the user with a form to set or change their display name.
 */
function showNameForm(type) {
  if (type === 'set') {
    document.getElementById('initial-name-form-container').style.display = 'block';
  } else {
    document.getElementById('name-form-container').style.display = 'block';
  }
}

/*
 * Presents the user with a form to change their profile picture.
 */
function showImageForm() {
  fetch('/blobstore-profile-upload-url').then((response) => {
    return response.text();
  }).then((imageUploadUrl) => {
    document.getElementById('image-form-container').style.display = 'block';
    document.getElementById('image-form').action = imageUploadUrl;
  });
}

/*
 * Hides the form for the user to change their profile picture.
 */
function hideImageForm() {
  document.getElementById('image-form-container').style.display = 'none';
}

/*
 * Hides the form for the user to change their display name.
 */
function hideNameForm() {
  document.getElementById('name-form-container').style.display = 'none';
}

/*
 * Updates local storage once the user has set their display name.
 */
function updateSetName() {
  localStorage.setItem(LOCAL_STORAGE_NAME, document.getElementById('set-name').value);
}

/*
 * Updates local storage once the user has changed their display name.
 */
function updateChangedName() {
  localStorage.setItem(LOCAL_STORAGE_NAME, document.getElementById('changed-name').value);
}
