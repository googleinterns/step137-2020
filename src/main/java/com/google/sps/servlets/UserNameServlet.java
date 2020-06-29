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

@WebServlet("/user-name")
public class UserNameServlet extends HttpServlet {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse respone) throws IOException {
      UserService userService = UserServiceFactory.getUserService();

      String name = request.getParamter(Constants.USER_NAME_PARAM);
      String id = userService.getCurrentUser().getUserId();

      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

      // Get the User entity with the same "id" property as the current user id.
      Query query = new Query(Constants.USER_ENTITY_PARAM).
          setFilter(new Query.FilterPredicate(Constants.USER_ID_PARAM, Query.FilterOperator.EQUAL, id));
      PreparedQuery results = datastore.prepare(query);
      Entity existingUserEntity = results.asSingleEntity();

      // If the User entity does not already exist, create it and put it in datastore
      // with its set "id" and "name" properties.
      if (existingUserEntity == null) {
        Entity newUserEntity = new Entity(Constants.USER_ENTITY_PARAM);
        newUserEntity.setProperty(Constants.USER_ID_PARAM, id);
        newUserEntity.setProperty(Constants.USER_NAME_PARAM, name);
        datastore.put(newUserEntity);
      
      // If the User entity exists, put it in datastore with its updated "name" property.
      } else {
        existingUserEntity.setProperty(Constants.USER_NAME_PARAM, name);
        datastore.put(existingUserEntity);
      }
    
      response.sendRedirect("/profile.html");
    }
}
