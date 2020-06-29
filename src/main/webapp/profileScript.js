/*
 * Loads certain buttons in the navbar based on the user's login status.
 */
function getLoginStatus() {
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const personalProfileButton = document.getElementById('personal-profile-button');
  const promise = fetch('/login').then(response => response.text()).then((message) => {
    // If the user is logged in, hide the login button and display the logout and profile buttons.
    if (message.localeCompare('yes') == 0) {
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';
      personalProfileButton.style.display = 'block';
    } else {
    // If the user is logged out, display the login button and hide the logout and profile buttons.
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
      personalProfileButton.style.display = 'none';
    }
  });
}
