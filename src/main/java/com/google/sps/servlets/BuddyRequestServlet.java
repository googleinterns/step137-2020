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

@WebServlet("/buddy-request")
public class BuddyRequestServlet extends HttpServlet {
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    String currentUserId = userService.getCurrentUser().getUserId();
    String otherUserId = request.getParameter(Constants.BUDDY_USER_PARAM);
    String action = request.getParameter(Constants.BUDDY_ACTION_PARAM);

    Entity currentUserEntity = getUserEntity(currentUserId);
    Entity otherUserEntity = getUserEntity(otherUserId);

    List<String> currentUserBuddyRequests = (List<String>) currentUserEntity
          .getProperty(Constants.USER_BUDDY_REQUESTS_PARAM);
    List<String> otherUserBuddyRequests = (List<String>) otherUserEntity
          .getProperty(Constants.USER_BUDDY_REQUESTS_PARAM);
 
    if (action.equals(Constants.BUDDY_REQUEST_SEND_PARAM)) {
      // Send a buddy request by adding the current user's ID to the 
      // other user's list of buddy requests (if it is not already in it).
      if (!otherUserBuddyRequests.contains(currentUserId)) {
        otherUserBuddyRequests.add(currentUserId);
        otherUserEntity.setProperty(Constants.USER_BUDDY_REQUESTS_PARAM, otherUserBuddyRequests);
        datastore.put(otherUserEntity);
      }
    } else if (action.equals(Constants.BUDDY_REQUEST_UNSEND_PARAM)){
      // Unsend a buddy request by removing the current user's ID from the 
      // other user's list of buddy requests (if it is in it).
      if (otherUserBuddyRequests.contains(currentUserId)) {
        otherUserBuddyRequests.remove(currentUserId);
        otherUserEntity.setProperty(Constants.USER_BUDDY_REQUESTS_PARAM, otherUserBuddyRequests);
        datastore.put(otherUserEntity);
      }
    } else {
      // Remove a buddy request by removing the other user's ID from the 
      // current user's list of buddy requests (if it is in it).
      if (currentUserBuddyRequests.contains(otherUserId)) {
        currentUserBuddyRequests.remove(otherUserId);
        currentUserEntity.setProperty(Constants.USER_BUDDY_REQUESTS_PARAM, currentUserBuddyRequests);
        datastore.put(currentUserEntity);
      }
    }
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
