package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.Constants;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;

@WebServlet("/user-name")
public class UserNameServlet extends HttpServlet {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
      UserService userService = UserServiceFactory.getUserService();
      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

      String name = request.getParameter(Constants.USER_NAME_PARAM);
      String id = userService.getCurrentUser().getUserId();

      Entity existingUserEntity = getUserEntity(id);

      // If a User entity with the current user's id does not already exist, create it.
      if (existingUserEntity == null) {
        Entity newUserEntity = createNewUser(id, name);
        datastore.put(newUserEntity);
      
      // If the User entity exists, put it in datastore with its updated "name" property.
      } else {
        existingUserEntity.setProperty(Constants.USER_NAME_PARAM, name);
        datastore.put(existingUserEntity);
      }
    
      response.sendRedirect("/profile.html");
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
      UserService userService = UserServiceFactory.getUserService();

      // Get the name property of the current User entity, or an empty string otherwise. 
      String name = "";
      Entity currentUserEntity = getUserEntity(userService.getCurrentUser().getUserId());
      if (currentUserEntity != null) {
        name = (String) currentUserEntity.getProperty(Constants.USER_NAME_PARAM);
      }

      response.setContentType("text/html");
      response.getWriter().println(name);
    }

    /** Returns the User entity with the specified "id" property, or null if one could not be found. */
    private Entity getUserEntity(String id) {
      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
      Query query = new Query(Constants.USER_ENTITY_PARAM)
          .setFilter(new Query.FilterPredicate(Constants.USER_ID_PARAM, Query.FilterOperator.EQUAL, id));
      PreparedQuery results = datastore.prepare(query);
      return results.asSingleEntity();
    }

    /** Returns a newly created User entity with the specified ID and name. */
    private Entity createNewUser(String id, String name) {
      Entity newUserEntity = new Entity(Constants.USER_ENTITY_PARAM);
      newUserEntity.setProperty(Constants.USER_ID_PARAM, id);
      newUserEntity.setProperty(Constants.USER_NAME_PARAM, name);
      newUserEntity.setProperty(Constants.USER_INTERESTS_PARAM, new ArrayList<>());
      return newUserEntity;
    }
}
