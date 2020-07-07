package com.google.sps.servlets;

import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.Constants;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/interest")
public class InterestServlet extends HttpServlet {
  
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String placeId = request.getParameter(Constants.INTEREST_ID_PARAM);
    String locationName = request.getParameter(Constants.INTEREST_NAME_PARAM);

    UserService userService = UserServiceFactory.getUserService();
    String userId = userService.getCurrentUser().getUserId();

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query(Constants.INTEREST_ENTITY_PARAM)
        .setFilter(new Query.FilterPredicate(Constants.INTEREST_ID_PARAM, Query.FilterOperator.EQUAL, placeId));
    PreparedQuery results = datastore.prepare(query);
    Entity interestEntity = results.asSingleEntity();

    if (interestEntity == null) {
      Entity newInterestEntity = createNewInterest(placeId, locationName, userId);
      datastore.put(newInterestEntity);
    } else {
      List<String> interestedUsers = (List<String>) interestEntity.getProperty(Constants.INTEREST_USERS_PARAM);
      
      // If the user has already saved this interest, remove them from the list of users.
      if (interestedUsers.contains(userId)) {
        interestedUsers.remove(userId);
      
      // If the user has not yet saved it, add them to the list of users.
      } else {
        interestedUsers.add(userId);
      }
      interestEntity.setProperty(Constants.INTEREST_USERS_PARAM, interestedUsers);
      datastore.put(interestEntity);
    }
  }

  /** Returns a newly created Interest entity with the specified location ID and name and user ID. */
  private Entity createNewInterest(String placeId, String locationName, String userId) {
    Entity newInterestEntity = new Entity(Constants.INTEREST_ENTITY_PARAM);
    newInterestEntity.setProperty(Constants.INTEREST_ID_PARAM, placeId);
    newInterestEntity.setProperty(Constants.INTEREST_NAME_PARAM, locationName);
    List<String> interestedUsers = new ArrayList<>();
    interestedUsers.add(userId);
    newInterestEntity.setProperty(Constants.INTEREST_USERS_PARAM, interestedUsers);
    return newInterestEntity;
  }
}
