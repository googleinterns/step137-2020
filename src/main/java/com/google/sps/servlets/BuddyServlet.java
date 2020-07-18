package com.google.sps.servlets;

import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.data.Constants;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/buddy")
public class BuddyServlet extends HttpServlet {
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    String currentUserId = userService.getCurrentUser().getUserId();
    String otherUserId = request.getParameter(Constants.BUDDY_USER_PARAM);
    String action = request.getParameter(Constants.BUDDY_ACTION_PARAM);

    Entity currentUserEntity = getUserEntity(currentUserId);
    Entity otherUserEntity = getUserEntity(otherUserId);

    List<String> currentUserBuddies = (List<String>) currentUserEntity
        .getProperty(Constants.USER_BUDDIES_PARAM);
    List<String> otherUserBuddies = (List<String>) otherUserEntity
        .getProperty(Constants.USER_BUDDIES_PARAM);

    // Based on the requested action, add or remove the buddy connection.
    if (action.equals(Constants.BUDDY_ADD_PARAM)) {
      currentUserBuddies.add(otherUserId);
      otherUserBuddies.add(currentUserId);
      // Remove the other user's ID from the current user's buddy requests.
      List<String> currentUserBuddyRequests = (List<String>) currentUserEntity
          .getProperty(Constants.USER_BUDDY_REQUESTS_PARAM);
      currentUserBuddyRequests.remove(otherUserId);
      currentUserEntity.setProperty(Constants.USER_BUDDY_REQUESTS_PARAM, currentUserBuddyRequests);
    } else {
      currentUserBuddies.remove(otherUserId);
      otherUserBuddies.remove(currentUserId);
    }

    currentUserEntity.setProperty(Constants.USER_BUDDIES_PARAM, currentUserBuddies);
    otherUserEntity.setProperty(Constants.USER_BUDDIES_PARAM, otherUserBuddies);
    datastore.put(currentUserEntity);
    datastore.put(otherUserEntity);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    String userId = userService.getCurrentUser().getUserId();
    Entity userEntity = getUserEntity(userId);
    List<String> buddies = (List<String>) userEntity.getProperty(Constants.USER_BUDDIES_PARAM);

    Gson gson = new Gson();
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(buddies));
  }

  /** Returns the User entity with the specified ID, or null if one could not be found. */
  private Entity getUserEntity(String id) {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query(Constants.USER_ENTITY_PARAM)
        .setFilter(new Query.FilterPredicate(Constants.USER_ID_PARAM, 
            Query.FilterOperator.EQUAL, id));
    PreparedQuery results = datastore.prepare(query);
    return results.asSingleEntity();
  }
}
