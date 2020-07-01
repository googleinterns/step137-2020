package com.google.sps.servlets;

import com.google.appengine.api.datastore.*;
import com.google.gson.Gson;
import com.google.sps.data.Constants;
import com.google.sps.data.User;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/user")
public class UserServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    List<User> users = new ArrayList<>();

    String idParam = request.getParameter(Constants.USER_ID_PARAM);
    if (idParam != null) {
      getUserById(datastore, users, idParam);
    } else {
      getAllUsers(datastore, users);
    }

    Gson gson = new Gson();

    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(users));
  }
  
  /** Adds the user with the specified ID from datastore to the list of users. */
  private void getUserById(DatastoreService datastore, List<User> users, String userId) {
    Query query = new Query(Constants.USER_ENTITY_PARAM)
        .setFilter(new Query.FilterPredicate(Constants.USER_ID_PARAM, Query.FilterOperator.EQUAL, userId));
    PreparedQuery results = datastore.prepare(query);
    Entity userEntity = results.asSingleEntity();
    String id = (String) userEntity.getProperty(Constants.USER_ID_PARAM);
    String name = (String) userEntity.getProperty(Constants.USER_NAME_PARAM);
    User user = new User(id, name);
    users.add(user);
  }

  /** Adds all the users from datastore to the list of users. */
  private void getAllUsers(DatastoreService datastore, List<User> users) {
    Query query = new Query(Constants.USER_ENTITY_PARAM);
    PreparedQuery results = datastore.prepare(query);
    for (Entity userEntity : results.asIterable()) {
      String id = (String) userEntity.getProperty(Constants.USER_ID_PARAM);
      String name = (String) userEntity.getProperty(Constants.USER_NAME_PARAM);
      User user = new User(id, name);
      users.add(user);
    }
  }
}
