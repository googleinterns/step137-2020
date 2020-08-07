/*
 * Defines prototype version of the functions within searchUsersScript to be tested.
 */
function SearchUsersService() {
}

/*
 * Given an array of the names of existing users and a string of the text
 * the user has searched, returns an array of arrays of the names which contain
 * the searched text and the index within the string at which the text occurs.
 */
SearchUsersService.prototype.searchUsers = function(userNames, searchText) {
  var searchedUsers = [];
  for (var i = 0; i < userNames.length; i ++) {
    var searchIndex = userNames[i].toLowerCase().indexOf(searchText.toLowerCase());
    if (searchIndex != -1) {
      searchedUsers.push([userNames[i], searchIndex]);
    }
  }
  return searchedUsers;
};

/*
 * Given the array of arrays returned by searchUsers, returns an array with the
 * names in order of the index at which the searched text occurs within the name.
 */
SearchUsersService.prototype.displaySearchedUsers = function(searchedUsers) {
  if (searchedUsers.length == 0) {
    return 'No users with that name could be found.';
  } else {
    var userIndex = 0;
    var firstUser = searchedUsers[userIndex];
    var orderedSearchedUsers = [];
    while (searchedUsers.length > 0) {
      for (var i = 0; i < searchedUsers.length; i ++) {
        if (searchedUsers[i][1] < firstUser[1]) {
          userIndex = i;
          firstUser = searchedUsers[userIndex];
        }
      }
      // Add the user with the earliest index of the search text.
      orderedSearchedUsers.push(firstUser[0])
      // Remove that user from the list and set a new placeholder first user.
      searchedUsers.splice(userIndex, 1);
      userIndex = 0;
      firstUser = searchedUsers[userIndex];
    }
    return orderedSearchedUsers;
  }
};
