package com.google.sps.servlets;

import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.util.ArrayList;
import java.util.List;
import com.google.sps.data.Constants;
import org.json.JSONObject;

@WebServlet("/likes")
public class LikesServlet extends HttpServlet {
  
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {  
    UserService userService = UserServiceFactory.getUserService();
    JSONObject json = new JSONObject();
    //user cannot like comments if they aren't logged in 
    if (!userService.isUserLoggedIn()) {
      return;
    }   
    
    long postId = Long.parseLong(request.getParameter("id"));
    String currentUserId = userService.getCurrentUser().getUserId();
    
    Query query = new Query(Constants.POST_ENTITY_PARAM);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      if (entity.getKey().getId() == postId) {
        List<String> likes = (List<String>) entity.getProperty(Constants.LIKES_PARAM);
        if (likes.contains(currentUserId)) {
          //if a user has already liked a commnet, pushing the like button again
          //serves to remove their like 
          likes.remove(currentUserId);
          json.put("count", likes.size() - 1);
        }
        else {
          likes.add(currentUserId);
          json.put("count", likes.size() - 1);
        }
        entity.setProperty(Constants.LIKES_PARAM, likes);
        datastore.put(entity);
        //once the likes have been updated there is no need to continue checking;
        break;
      }
    }
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }
}
