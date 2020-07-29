package com.google.sps.servlets;

import com.google.sps.data.Constants;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;

/** Servlet responsible for handling attendees' responses of "Going" to specified events */
@WebServlet("/going-attendee")
public class GoingAttendeeServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    String currentUserId = userService.getCurrentUser().getUserId();
    long eventId = Long.parseLong(request.getParameter("eventId"));
    //Key eventEntityKey = KeyFactory.createKey(Constants.EVENT_ENTITY_PARAM, eventId);
    //Entity eventEntity = getEventEntity(eventEntityKey);
    
    Query query = new Query(Constants.EVENT_ENTITY_PARAM);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    for (Entity eventEntity : results.asIterable()) {
      if (eventEntity.getKey().getId() == eventId) {
        // Get going attendees.
        List<String> goingAttendees = 
            (List<String>) eventEntity.getProperty(Constants.GOING_ATTENDEES_PARAM);
        // Get not going attendees.
        List<String> notGoingAttendees = 
            (List<String>) eventEntity.getProperty(Constants.NOT_GOING_ATTENDEES_PARAM);
        
        if (goingAttendees.contains(currentUserId)) {
          // Remove the user from the list of going attendees.
          goingAttendees.remove(currentUserId);
        } else {
          // Add the user to the list of going attendees and remove it from its previous list.
          goingAttendees.add(currentUserId);
          if (notGoingAttendees.contains(currentUserId)) {
            notGoingAttendees.remove(currentUserId);
          }
        }
        eventEntity.setProperty(Constants.GOING_ATTENDEES_PARAM, goingAttendees);
        eventEntity.setProperty(Constants.NOT_GOING_ATTENDEES_PARAM, notGoingAttendees);
        datastore.put(eventEntity);
        break;
      }
    }
  }

  /*private Entity getEventEntity(Key eventEntityKey) {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query(Constants.EVENT_ENTITY_PARAM)
        .setFilter(new Query.FilterPredicate(Constants.EVENT_KEY_PARAM, 
            Query.FilterOperator.EQUAL, eventEntityKey));
    PreparedQuery results = datastore.prepare(query);
    return results.asSingleEntity();
  }*/
}
