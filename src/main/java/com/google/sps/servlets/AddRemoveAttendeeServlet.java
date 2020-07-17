package com.google.sps.servlets;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.sps.data.Constants;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;

/** Servlet responsible for adding and removing attendees from a specified event */
@WebServlet("/add-remove-attendee")
public class AddRemoveAttendeeServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    String currentUserId = userService.getCurrentUser().getUserId();
    long eventId = Long.parseLong(request.getParameter("eventId"));

    Query query = new Query(Constants.EVENT_ENTITY_PARAM);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      if (entity.getKey().getId() == eventId) {
        //get rsvp attendees
        List<String> rsvpAttendees = 
            (List<String>) entity.getProperty(Constants.RSVP_ATTENDEES_PARAM);
        
        //get invited attendees
        List<String> invitedAttendees = 
            (List<String>) entity.getProperty(Constants.INVITED_ATTENDEES_PARAM);
        
        //get privacy 
        String privacy = (String) entity.getProperty(Constants.PRIVACY_PARAM);

        if (rsvpAttendees.contains(currentUserId)) {
          rsvpAttendees.remove(currentUserId);
          if(privacy.equals("attendees") || privacy.equals("buddies-only")) {
            invitedAttendees.add(currentUserId);
          }
        }
        else {
          rsvpAttendees.add(currentUserId);
          if(privacy.equals("attendees") || privacy.equals("buddies-only")) {
            invitedAttendees.remove(currentUserId);
          }
        }

        entity.setProperty(Constants.RSVP_ATTENDEES_PARAM, rsvpAttendees);
        entity.setProperty(Constants.INVITED_ATTENDEES_PARAM, invitedAttendees);
        datastore.put(entity);

        break;
      }
    }
  }
}
