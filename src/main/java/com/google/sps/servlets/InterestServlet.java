package com.google.sps.servlets;

import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.data.Constants;
import com.google.sps.data.Interest;
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
        .setFilter(new Query.FilterPredicate(Constants.INTEREST_ID_PARAM, 
            Query.FilterOperator.EQUAL, placeId));
    PreparedQuery results = datastore.prepare(query);
    Entity interestEntity = results.asSingleEntity();

    if (interestEntity == null) {
      // If the interest entity does not yet exist, create a new one for the specified location
      // including the user, and add it to the datastore. 
      Entity newInterestEntity = createNewInterest(placeId, locationName, userId);
      datastore.put(newInterestEntity);
    } else {
      // If the interest entity already exists, either add or remove the user from it
      // depending on whether the user has already saved it.
      List<String> interestedUsers = (List<String>) interestEntity
          .getProperty(Constants.INTEREST_USERS_PARAM);
      if (interestedUsers.contains(userId)) {
        interestedUsers.remove(userId);
      } else {
        interestedUsers.add(userId);
      }
      interestEntity.setProperty(Constants.INTEREST_USERS_PARAM, interestedUsers);
      datastore.put(interestEntity);
    }
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(Constants.INTEREST_ENTITY_PARAM);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<Interest> interests = new ArrayList<>();

    for (Entity interestEntity : results.asIterable()) {
      // Get the attributes from all the stored Interest entities.
      String placeId = (String) interestEntity.getProperty(Constants.INTEREST_ID_PARAM);
      String locationName = (String) interestEntity.getProperty(Constants.INTEREST_NAME_PARAM);
      List<String> interestedUsers = (List<String>) interestEntity
          .getProperty(Constants.INTEREST_USERS_PARAM);

      // Create a Interest object with those attributes and add it to the list of interests.
      Interest interest = new Interest(placeId, locationName, interestedUsers);
      interests.add(interest);
    }

    Gson gson = new Gson();
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(interests));
  }

  /** Returns a newly created Interest entity with the specified location ID and name and user ID. */
  private Entity createNewInterest(String placeId, String locationName, String userId) {
    Entity newInterestEntity = new Entity(Constants.INTEREST_ENTITY_PARAM);
    newInterestEntity.setProperty(Constants.INTEREST_ID_PARAM, placeId);
    newInterestEntity.setProperty(Constants.INTEREST_NAME_PARAM, locationName);
    List<String> interestedUsers = new ArrayList<>();
    interestedUsers.add(""); // Placeholder entry to prevent empty list from becoming null
    interestedUsers.add(userId);
    newInterestEntity.setProperty(Constants.INTEREST_USERS_PARAM, interestedUsers);
    return newInterestEntity;
  }
}
