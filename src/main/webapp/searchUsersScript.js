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
        if (users[i].name.toLowerCase().includes(searchText.toLowerCase())) {
          // Display any users whose name contains the search text.
          searchedUsers.appendChild(createUserElement(users[i]));
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
