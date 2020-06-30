/*
 * Updates the page's display based on the user's login status.
 */
function loginStatusDisplay() {
  // Clear the user-specific elements previously displayed.
  const userNavbarSection = document.getElementById('user-navbar-section');
  userNavbarSection.innerHTML = '';

  // Get the login status and display the corresponding elements.
  const promise = fetch('/login').then(response => response.json()).then((json) => {
    // If the user is logged in, confirm that they have a name, 
    // then add the logout button and profile page button to the navbar.
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
        window.location.href = 'profile.html';
      });
      userNavbarSection.appendChild(logoutButton);
      userNavbarSection.appendChild(personalProfileButton);
    // If the user is logged out, add the login button to the navbar.
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
 * Confirms that the user already has a name, and if not sends them to update it.
 */
function confirmUserName() {
  console.log("yes, we are checking what we're supposed to");
  const promise = fetch('/user-name').then(response => response.text()).then((name) => {
    if (name.localeCompare('\n') == 0) {
      updateName();
    }
  })
}

/*
 * Displays a form for the user to update their name.
 */
function updateName() {
  document.getElementById('name-form-container').style.display = 'block';
}
