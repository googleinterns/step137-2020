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

/** Servlet responsible for handling attendees' responses of "Not Going" to specified events */
@WebServlet("/not-going-attendee")
public class NotGoingAttendeeServlet extends HttpServlet {

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
        // Get not going attendees.
        List<String> notGoingAttendees = 
            (List<String>) eventEntity.getProperty(Constants.NOT_GOING_ATTENDEES_PARAM);
        // Get invited attendees
        List<String> invitedAttendees =
            (List<String>) eventEntity.getProperty(Constants.INVITED_ATTENDEES_PARAM);
        // Get going attendees.
        List<String> goingAttendees = 
            (List<String>) eventEntity.getProperty(Constants.GOING_ATTENDEES_PARAM);
        // Get privacy 
        String privacy = (String) eventEntity.getProperty(Constants.PRIVACY_PARAM);
        
        if (notGoingAttendees.contains(currentUserId)) {
          // Remove the user from the list of not going attendees, and add it to the list of
          // invited attendees if it's a private event .
          notGoingAttendees.remove(currentUserId);
          if (privacy.equals("attendees") || privacy.equals("buddies-only")) {
           invitedAttendees.add(currentUserId);
          }
        } else {
          // Add the user to the list of not going attendees and remove it from its previous list.
          notGoingAttendees.add(currentUserId);
          if (goingAttendees.contains(currentUserId)) {
            goingAttendees.remove(currentUserId);
          } else if (invitedAttendees.contains(currentUserId)) {
            invitedAttendees.remove(currentUserId);
          }
        }
        eventEntity.setProperty(Constants.NOT_GOING_ATTENDEES_PARAM, notGoingAttendees);
        eventEntity.setProperty(Constants.INVITED_ATTENDEES_PARAM, invitedAttendees);
        eventEntity.setProperty(Constants.GOING_ATTENDEES_PARAM, goingAttendees);
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
