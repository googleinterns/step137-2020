/*
 * Displays the page's content as soon as the page is laoded.
 */
function searchUsersOnload() {
  navbarLoginDisplay();
}

/*
 * Finds the users whose names contain the searched text.
 */
function searchUsers() {
  const searchText = document.getElementById('search-text').value;
  if (searchText !== '') {
  let searchedUsers = [];
    fetch('/user').then(response => response.json()).then((users) => {
      for (let i = 0; i < users.length; i ++) {
        let searchIndex = users[i].name.toLowerCase().indexOf(searchText.toLowerCase());
        if (searchIndex != -1) {
          searchedUsers.push([users[i], searchIndex]);
        }
      }
      displaySearchedUsers(searchedUsers);
    });
  } else {
    displaySearchedUsers([]);
  }
}

/*
 * Displays the searched users in order of those with the search text
 * contained earlier in their names first.
 */
function displaySearchedUsers(searchedUsers) {
  const searchedUsersContainer = document.getElementById('searched-users');
  searchedUsersContainer.innerHTML = '';
  searchedUsersContainer.style = 'height: 100%';
  if (searchedUsers.length == 0) {
    // Display a message if no users' names contained the search text.
    const searchMessage = document.createElement('p');
    searchMessage.innerText = 'No users with that name could be found.';
    searchedUsersContainer.appendChild(searchMessage);
  } else {
    let userIndex = 0;
    let firstUser = searchedUsers[userIndex];
    while (searchedUsers.length > 0) {
      for (let i = 0; i < searchedUsers.length; i ++) {
        if (searchedUsers[i][1] < firstUser[1]) {
          userIndex = i;
          firstUser = searchedUsers[userIndex];
        }
      }
      // Display the user with the earliest index of the search text.
      searchedUsersContainer.appendChild(createUserElement(firstUser[0]));
      // Remove that user from the list and set a new placeholder first user.
      searchedUsers.splice(userIndex, 1);
      userIndex = 0;
      firstUser = searchedUsers[userIndex];
    }
  }
}
