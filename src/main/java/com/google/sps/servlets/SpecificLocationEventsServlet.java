package com.google.sps.servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Collections;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.sps.data.Constants;
import com.google.sps.data.Event;
import com.google.gson.Gson;
import java.lang.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.text.ParseException; 

@WebServlet("/location-specific-events")
public class SpecificLocationEventsServlet extends HttpServlet {
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String placeId = request.getParameter(Constants.PLACE_ID_PARAM);
    Query query = new Query(Constants.EVENT_ENTITY_PARAM)
        .setFilter(new Query.FilterPredicate(Constants.PLACE_ID_PARAM, 
            Query.FilterOperator.EQUAL, placeId));
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);
 
     // Converting the list of entities to a list of events.
    List<Event> events = new ArrayList<>();
    for (Entity entity : results.asIterable()) {
      // Main features of event 
      long eventID = entity.getKey().getId();
      String eventName = 
          (String) entity.getProperty(Constants.EVENT_NAME_PARAM);
      String dateTime = 
          (String) entity.getProperty(Constants.DATE_TIME_PARAM);
      String location = 
          (String) entity.getProperty(Constants.LOCATION_PARAM);
      String eventDetails = 
          (String) entity.getProperty(Constants.EVENT_DETAILS_PARAM);
      String privacy = 
          (String) entity.getProperty(Constants.PRIVACY_PARAM);
      String yesCOVIDSafe = 
          (String) entity.getProperty(Constants.COVID_SAFE_PARAM);
      List<String> invitedAttendees = 
          (List<String>) entity.getProperty(Constants.INVITED_ATTENDEES_PARAM);
      List<String> goingAttendees = 
          (List<String>) entity.getProperty(Constants.GOING_ATTENDEES_PARAM);
      List<String> notGoingAttendees = 
          (List<String>) entity.getProperty(Constants.NOT_GOING_ATTENDEES_PARAM);
      String creator = 
          (String) entity.getProperty(Constants.CREATOR_PARAM);

      // Stored so events can be sorted by start time (makes display easier).
      Date startDateTime = (Date) entity.getProperty(Constants.START_DATE_TIME_PARAM);
      Date endDateTime = (Date) entity.getProperty(Constants.END_DATE_TIME_PARAM);
      String timeZone = (String) entity.getProperty(Constants.TIME_ZONE_PARAM);
      String currency = eventCurrency(endDateTime, timeZone);

      // Original date/time request strings (for display in form if user edits event).
      String originalStartDate = (String) entity.getProperty(Constants.START_DATE_PARAM);
      String originalEndDate = (String) entity.getProperty(Constants.END_DATE_PARAM);
      String originalStartTime = (String) entity.getProperty(Constants.START_TIME_PARAM);
      String originalEndTime = (String) entity.getProperty(Constants.END_TIME_PARAM);

      Event event = new Event.EventBuilder(eventID)
          .setEventName(eventName) 
          .setDateTime(dateTime)
          .setStartDate(originalStartDate)
          .setStartTime(originalStartTime)
          .setEndDate(originalEndDate)
          .setEndTime(originalEndTime)
          .setStartDateTime(startDateTime)
          .setLocation(location) 
          .setPlaceId(placeId) 
          .setEventDetails(eventDetails)
          .setYesCOVIDSafe(yesCOVIDSafe)
          .setPrivacy(privacy)
          .setInvitedAttendees(invitedAttendees)
          .setGoingAttendees(goingAttendees)
          .setNotGoingAttendees(notGoingAttendees)
          .setCreator(creator)
          .setCurrency(currency)
          .build();
      events.add(event);
    }
    Collections.sort(events);

    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(events));
  }

  /** Determines if the event is current or past. */
  private String eventCurrency(Date endDate, String timeZone) {
    SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyyy HH:mm z");
    formatter.setTimeZone(TimeZone.getTimeZone(timeZone));
    Date date = new Date();
    Date currentDate = new Date();
    try {
      String currentDateString = formatter.format(date);
      currentDate = formatter.parse(currentDateString);
    } catch (ParseException e) {e.printStackTrace();}
    if (endDate.before(currentDate) || endDate.equals(currentDate)) {
      return "past";
    }
    return "current";
  }
}
