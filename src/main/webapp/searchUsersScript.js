/*
 * Displays all of the site's users (placeholder until actual search feature).
 */
function displayUsers() {
  const loadedUsers = document.getElementById('loaded-users');
  loadedUsers.innerHTML = '';
  
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
  userDisplay.setAttribute('data-id', user.id);
  return userDisplay;
}
