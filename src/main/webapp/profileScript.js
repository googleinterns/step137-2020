/*
 * Updates the page's display based on the user's login status.
 */
function loginStatusDisplay() {
  // Clear the user-specific elements previously displayed.
  const userNavbarSection = document.getElementById('user-navbar-section');
  userNavbarSection.innerHTML = '';

  // Get the login status and display the corresponding elements.
  const promise = fetch('/login').then(response => response.json()).then((json) => {
    if (json['loginStatus'].localeCompare('true') == 0) {
      addLoggedInDisplay();
    } else {
      addLoggedOutDisplay();
    }
  });
}

/*
 * Adds the elements that should be displayed when the user is logged in.
 */
function addLoggedInDisplay() {
  // Add the logout button and profile page button to the navbar.
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
}

/*
 * Adds the elements that should be displayed when the user is logged out.
 */
function addLoggedOutDisplay() {
  // Add the login button to the navbar.
  const loginButton = document.createElement('button');
  loginButton.innerText = 'Login';
  loginButton.addEventListener('click', () => {
    window.location.href = json['loginUrl'];
  });
  userNavbarSection.appendChild(loginButton);
}
