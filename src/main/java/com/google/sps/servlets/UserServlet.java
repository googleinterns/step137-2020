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
    Query query = new Query(Constants.USER_ENTITY_PARAM);
    PreparedQuery results = datastore.prepare(query);
    List<User> users = new ArrayList<>();

    for (Entity userEntity : results.asIterable()) {
      // Get the attributes from all the stored User entities.
      String id = (String) userEntity.getProperty(Constants.USER_ID_PARAM);
      String name = (String) userEntity.getProperty(Constants.USER_NAME_PARAM);

      // Create a User object with those attributes and add it to the list of users.
      User user = new User(id, name);
      users.add(user);
    }

    Gson gson = new Gson();
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(users));
  }
}
