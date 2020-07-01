package com.google.sps.servlets;

import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.Constants;
import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/interest")
public class InterestServlet extends HttpServlet {
  
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String locationName = request.getParameter(Constants.INTEREST_NAME_PARAM);

    UserService userService = UserServiceFactory.getUserService();
    String userId = userService.getCurrentUser().getUserId();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query(Constants.USER_ENTITY_PARAM)
        .setFilter(new Query.FilterPredicate(Constants.USER_ID_PARAM, Query.FilterOperator.EQUAL, userId));
    PreparedQuery results = datastore.prepare(query);
    Entity userEntity = results.asSingleEntity();

    List<String> interests = (List<String>) userEntity.getProperty(Constants.USER_INTERESTS_PARAM);
    // removes the interest if it has already been saved by the user
    if (interests.contains(locationName)) {
      interests.remove(locationName);
    }
    // adds the interest if it has not yet been saved by the user
    else {
      interests.add(locationName);
    }

    userEntity.setProperty(Constants.USER_INTERESTS_PARAM, interests);
    datastore.put(userEntity);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

  }
}
