/*
 * Displays the page's content as soon as the page is laoded.
 */
function searchUsersOnload() {
  navbarLoginDisplay();
}

/*
 * Displays the found users from the current user's search.
 */
function displaySearchedUsers() {
  const searchedUsers = document.getElementById('searched-users');
  searchedUsers.style = 'height: 100%';
  const searchText = document.getElementById('search-text').value;
  if (searchText === '') {
    // Don't return results for an empty search.
    searchedUsers.innerHTML = '';
  } else {
    fetch('/user').then(response => response.json()).then((users) => {
      searchedUsers.innerHTML = '';
      let userCount = 0;
      for (let i = 0; i < users.length; i ++) {
        if (users[i].name.includes(searchText)) {
          // Display any users whose name contains the search text.
          searchedUsers.appendChild(loadUser(users[i]));
          userCount ++;
        }
      }
      if (userCount == 0) {
        const searchMessage = document.createElement('p');
        searchMessage.innerText = 'No users with that name could be found.';
        searchedUsers.appendChild(searchMessage);
      }
    });
  }
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
  sessionStorage.setItem(SESSION_STORAGE_PROFILE, userId);
  window.location.href = 'profile.html';
}
