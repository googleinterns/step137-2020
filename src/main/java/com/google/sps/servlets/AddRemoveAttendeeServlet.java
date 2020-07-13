package com.google.sps.servlets;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
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
    String currentUserId = request.getParameter("userId");
    long rsvpEvent = Long.parseLong(request.getParameter("eventId"));
    
    response.getWriter().print(currentUserId);

    Query query = new Query(Constants.EVENT_ENTITY_PARAM);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      if (entity.getKey().getId() == rsvpEvent) {
        //get rsvp attendees
        List<String> entityRSVPAttendees = 
            (List<String>) entity.getProperty(Constants.RSVP_ATTENDEES_PARAM);
        List<String> rsvpAttendees = new ArrayList<>(entityRSVPAttendees);
        
        //get invited attendees
        List<String> entityInvitedAttendees = 
            (List<String>) entity.getProperty(Constants.INVITED_ATTENDEES_PARAM);
        List<String> invitedAttendees = new ArrayList<>(entityInvitedAttendees);
        
        //get privacy 
        String privacy = (String) entity.getProperty(Constants.PRIVACY_PARAM);

        if (rsvpAttendees.contains(currentUserId)) {
          rsvpAttendees.remove(currentUserId);
          if(privacy == "attendees" || privacy == "buddies-only") {
            invitedAttendees.add(currentUserId);
          }
        }
        else {
          rsvpAttendees.add(currentUserId);
        }

        entity.setProperty(Constants.RSVP_ATTENDEES_PARAM, rsvpAttendees);
        datastore.put(entity);

        break;
      }
    }
  }
}

