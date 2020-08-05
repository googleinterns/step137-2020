/*
 * Defines tests for the prototype functions in SearchUsersService.
 */
describe("the searched users", function() {
  var searchUsersService;

  beforeEach(function() {
    searchUsersService = new SearchUsersService();
  });

  // Tests for the searchUsers function:
  it("may not find any matching users", function () {
    var users = searchUsersService.searchUsers(["timothy", "tomothy"], "jim");
    var expected = [];
    expect(users).toEqual(expected);
  });

  it("may find just one matching user", function () {
    var users = searchUsersService.searchUsers(["timothy", "tomothy"], "timothy");
    var expected = [["timothy", 0]];
    expect(users).toEqual(expected);
  });

  it("may find users with the search text in different parts", function () {
    var users = searchUsersService.searchUsers(["timothy", "moth", "lots of moths"], "moth");
    var expected = [["timothy", 2], ["moth", 0], ["lots of moths", 8]];
    expect(users).toEqual(expected);
  });

  it("may find users with the search text in a different case", function () {
    var users = searchUsersService.searchUsers(["timothy", "Timothy", "TIMMY"], "tim");
    var expected = [["timothy", 0], ["Timothy", 0], ["TIMMY", 0]];
    expect(users).toEqual(expected);
  });

  // Tests for the displaySearchedUsers function:
  it("may not display any users", function () {
    var users = searchUsersService.displaySearchedUsers([]);
    var expected = "No users with that name could be found.";
    expect(users).toBe(expected);
  });

  it("may have just one user to display", function () {
    var users = searchUsersService.displaySearchedUsers([["timothy", 0]]);
    var expected = ["timothy"];
    expect(users).toEqual(expected);
  });
  
  it("may have to display users in order of searched text index", function () {
    var users = searchUsersService
        .displaySearchedUsers([["timothy", 2], ["moth", 0], ["lots of moths", 8]]);
    var expected = ["moth", "timothy", "lots of moths"];
    expect(users).toEqual(expected);
  });

  it("may have to display users with the same searched text index", function () {
    var users = searchUsersService
        .displaySearchedUsers([["timothy", 0], ["Timothy", 0], ["TIMMY", 0]]);
    var expected = ["timothy", "Timothy", "TIMMY"];
    expect(users).toEqual(expected);
  })

  it("may have to display users in order of searched text index, with some having the same", function () {
    var users = searchUsersService
        .displaySearchedUsers([["timothy", 2], ["moth", 0], ["lots of moths", 8], ["moths", 0]]);
    var expected = ["moth", "moths", "timothy", "lots of moths"];
    expect(users).toEqual(expected);
  })
});
