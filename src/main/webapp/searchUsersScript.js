/*
 * Displays the page's content as soon as the page is laoded.
 */
function searchUsersOnload() {
  navbarLoginDisplay();
  displayUsers();
}

/*
 * Displays all of the site's users (placeholder until actual search feature).
 */
function displayUsers() {
  const loadedUsers = document.getElementById('loaded-users');
  loadedUsers.innerHTML = '';
  loadedUsers.style = 'height: 100%';
  
  fetch('/user').then(response => response.json()).then((users) => {
    for (let i = 0; i < users.length; i ++) {
      loadedUsers.appendChild(loadUser(users[i]));
    }
  });
}

/*
 * Creates an element representing a user for the display.
 */
function loadUser(user) {
  const userDisplay = document.createElement('p');
  userDisplay.innerText = user.name;
  userDisplay.addEventListener('click', () => {
    visitProfile(user.id);
  });
  return userDisplay;
}

/*
 * Redirects the site to the clicked user's profile.
 */
function visitProfile(userId) {
  sessionStorage.setItem("loadProfile", userId);
  window.location.href = 'profile.html';
}
