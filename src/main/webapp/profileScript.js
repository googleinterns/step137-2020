/*
 * Loads certain buttons in the navbar based on the user's login status.
 */
function getLoginStatus() {
  const userNavbarSection = document.getElementById('user-navbar-section');
  userNavbarSection.innerHTML = '';

  const promise = fetch('/login').then(response => response.json()).then((json) => {

    // If the user is logged in, add a logout and profile button.
    if (json['loginStatus'].localeCompare('true') == 0) {
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

    // If the user is logged out, add a login button.
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
