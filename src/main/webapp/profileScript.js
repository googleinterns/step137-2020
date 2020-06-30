/*
 * Updates the page's display based on the user's login status.
 */
function loginStatusDisplay() {
  // Clear the user-specific elements previously displayed.
  const userNavbarSection = document.getElementById('user-navbar-section');
  userNavbarSection.innerHTML = '';
  const userInfo = document.getElementById('user-info');
  userInfo.innerHTML = '';

  // Get the login status and display the corresponding elements.
  const promise = fetch('/login').then(response => response.json()).then((json) => {
    if (json['loginStatus'].localeCompare('true') == 0) {
      confirmUserName();

      // Add the logout and profile buttons to the navbar.
      const logoutButton = document.createElement('button');
      logoutButton.innerText = 'Logout';
      logoutButton.addEventListener('click', () => {
        window.location.href = json['logoutUrl'];
      });
      const personalProfileButton = document.createElement('button');
      personalProfileButton.innerText = 'My Profile';
      personalProfileButton.addEventListener('click', () => {
        window.location.href = 'profile.html';
      });
      userNavbarSection.appendChild(logoutButton);
      userNavbarSection.appendChild(personalProfileButton);

      // Add the user's name to the profile info.
      const profileName = document.createElement('h1');
      profileName.innerText = json['name'];
      userInfo.appendChild(profileName);
    } else {
     
      // Add the login button to the navbar.
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
 * Confirms that the user already has a name, and if not sends them to update it.
 */
function confirmUserName() {
  const promise = fetch('/user-name').then(response => response.text()).then((name) => {
    if (name.localeCompare('\n') == 0) {
      updateName();
    }
  });
}

/*
 * Displays a form for the user to update their name.
 */
function updateName() {
  document.getElementById('name-form-container').style.display = 'block';
}
