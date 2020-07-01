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
  
    // If the user is logged in, confirm the user has a name, then 
    // add logout and profile buttons to the navbar.
    if (json['loginStatus'].localeCompare('true') == 0) {
      confirmUserName();
      const logoutButton = document.createElement('button');
      logoutButton.innerText = 'Logout';
      logoutButton.addEventListener('click', () => {
        window.location.href = json['logoutUrl'];
      });
      const personalProfileButton = document.createElement('button');
      personalProfileButton.innerText = 'My Profile';
      personalProfileButton.addEventListener('click', () => {
        visitProfile(json['id']);
      });
      userNavbarSection.appendChild(logoutButton);
      userNavbarSection.appendChild(personalProfileButton);
    
    // If the user is logged out, add a login button to the navbar.
    } else {
      const loginButton = document.createElement('button');
      loginButton.innerText = 'Login';
      loginButton.addEventListener('click', () => {
        window.location.href = json['loginUrl'];
      });
      userNavbarSection.appendChild(loginButton);
    }
  });
}

/*
 * Displays a form for the user to input their name if they do not yet have one.
 */
function confirmUserName() {
  const promise = fetch('/user-name').then(response => response.text()).then((name) => {
    if (name.localeCompare('\n') == 0) {
      document.getElementById('name-form-container').style.display = 'block';
    }
  });
}

/*
 * Redirects the site to the clicked user's profile.
 */
function visitProfile(userId) {
  const params = new URLSearchParams();
  params.append('id', userId);
  const request = new Request('/profile', {method: 'POST', body: params});
  const promise = fetch(request);
  promise.then(
    window.location.href = 'profile.html'
  );
}

/*
 * Displays the profile content of the requested user.
 */
function displayProfileContent() {
  fetch('/profile').then(response => response.text()).then((id) => {
    fetch('/user').then(response => response.json()).then((users) => {
      for (let i = 0; i < users.length; i ++) {
        if ((users[i].id + '\n').localeCompare(id) == 0) {
          displayBasicInfo(users[i]);
          displaySavedInterests(users[i]);
          break;
        }
      }
    });
  });
}

/*
 * Displays the basic info of the specified user.
 */
function displayBasicInfo(user) {
  const basicInfoContainer = document.getElementById('basic-info');
  basicInfoContainer.innerHTML = '';

  const name = document.createElement('h1');
  name.innerText = user.name;
  basicInfoContainer.appendChild(name);
}

/*
 * Displays the saved interests of the specified user.
 */
function displaySavedInterests(user) {
  const savedInterestsContainer = document.getElementById('interests-container');
  savedInterestsContainer.innerHTML = '';

  for (i = 1; i < user.interests.length; i ++) { // Starts at 1 to skip initial placeholder interest.
    const interest = document.createElement('p');
    interest.innerText = user.interests[i];
    savedInterestsContainer.appendChild(interest);
  }
}
