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
import com.google.sps.data.TimeHandler;
import com.google.gson.Gson;
import java.lang.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.text.ParseException; 
import org.json.JSONObject;

@WebServlet("/events")
public class EventServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String requestStartDate = request.getParameter(Constants.START_DATE_PARAM);
    String requestStartTime = request.getParameter(Constants.START_TIME_PARAM);
    String requestEndDate = request.getParameter(Constants.END_DATE_PARAM);
    String requestEndTime = request.getParameter(Constants.END_TIME_PARAM);
    String timeZone = request.getParameter(Constants.TIME_ZONE_PARAM);

    JSONObject json = new JSONObject();
    Date startDateTime = TimeHandler.parseInputDateTime(requestStartDate, requestStartTime, timeZone, json);
    Date endDateTime = TimeHandler.parseInputDateTime(requestEndDate, requestEndTime, timeZone, json);
    // Create dates without times for event currency comparison.
    Date startDate = TimeHandler.parseInputDate(requestStartDate, json);
    Date endDate = TimeHandler.parseInputDate(requestEndDate, json);
    
    boolean goodDateTimes = TimeHandler.verifyDateTimes(startDateTime, endDateTime, json);
    if (goodDateTimes) {
      createEntity(
        request, 
        endDateTime, 
        startDateTime, 
        startDate, 
        endDate, 
        json, 
        requestStartTime, 
        requestEndTime, 
        requestStartDate,
        requestEndDate,
        timeZone);  
    }

    response.setContentType("application/json;");
    response.getWriter().println(json);
  }



  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(Constants.EVENT_ENTITY_PARAM);
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
      String placeId = 
          (String) entity.getProperty(Constants.PLACE_ID_PARAM);
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
      String currency = TimeHandler.eventCurrency(endDateTime, timeZone);

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
          .setTimeZone(timeZone)
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

/** Creates an event entity in datastore. */
  private void createEntity(
      HttpServletRequest request, 
      Date endDateTime, 
      Date startDateTime, 
      Date startDate, 
      Date endDate, 
      JSONObject json, 
      String startTime, 
      String endTime, 
      String originalStartDate, 
      String originalEndDate, 
      String timeZone) {

    String eventName = request.getParameter(Constants.EVENT_NAME_PARAM);
    String location = request.getParameter(Constants.LOCATION_PARAM);
    String placeId = request.getParameter(Constants.PLACE_ID_PARAM);
    String eventDetails = request.getParameter(Constants.EVENT_DETAILS_PARAM);
    String yesCOVIDSafe = request.getParameter(Constants.COVID_SAFE_PARAM);
    String privacy = request.getParameter(Constants.PRIVACY_PARAM);
    String invitedAttendeesString = request.getParameter(Constants.INVITED_ATTENDEES_PARAM);
    List<String> invitedAttendeesList = Arrays.asList(invitedAttendeesString.split("\\s*,\\s*"));
    ArrayList<String> invitedAttendees = new ArrayList<String>(invitedAttendeesList);

    UserService userService = UserServiceFactory.getUserService();
    String currentUserID = userService.getCurrentUser().getUserId();
    if (privacy.equals("public")) {
      if (invitedAttendeesList.isEmpty()) {
        invitedAttendees.add(""); // Placeholder entry to prevent empty list from becoming null.
      }
    } else {
      invitedAttendees.add(currentUserID);
    }

    // List of people who said they will come. Creator is assumed to be attending.
    List<String> goingAttendees = new ArrayList<>();
    goingAttendees.add(""); // Placeholder entry to prevent empty list from becoming null.
    goingAttendees.add(currentUserID);

    // List of people who say they will not come.
    List<String> notGoingAttendees = new ArrayList<>();
    notGoingAttendees.add(""); // Placeholder entry to prevent empty list from becoming null.

    // Get formatted start and end times.
    String startTimeFormatted = TimeHandler.getTimeDisplay(startTime);
    String endTimeFormatted = TimeHandler.getTimeDisplay(endTime);
    
    // Get formatted dates and times for display.
    String dateTimeFormatted = TimeHandler.createDateTimeDisplay(startDate, startTimeFormatted, 
          endDate, endTimeFormatted, timeZone);

    Entity eventEntity = new Entity(Constants.EVENT_ENTITY_PARAM);
    eventEntity.setProperty(Constants.EVENT_NAME_PARAM, eventName);
    eventEntity.setProperty(Constants.END_DATE_TIME_PARAM, endDateTime);
    eventEntity.setProperty(Constants.START_DATE_TIME_PARAM, startDateTime);
    eventEntity.setProperty(Constants.TIME_ZONE_PARAM, timeZone);
    eventEntity.setProperty(Constants.START_DATE_PARAM, originalStartDate);
    eventEntity.setProperty(Constants.END_DATE_PARAM, originalEndDate);
    eventEntity.setProperty(Constants.START_TIME_PARAM, startTime);
    eventEntity.setProperty(Constants.END_TIME_PARAM, endTime);
    eventEntity.setProperty(Constants.DATE_TIME_PARAM, dateTimeFormatted);
    eventEntity.setProperty(Constants.LOCATION_PARAM, location);
    eventEntity.setProperty(Constants.PLACE_ID_PARAM, placeId);
    eventEntity.setProperty(Constants.EVENT_DETAILS_PARAM, eventDetails);
    eventEntity.setProperty(Constants.COVID_SAFE_PARAM, yesCOVIDSafe);
    eventEntity.setProperty(Constants.PRIVACY_PARAM, privacy);
    eventEntity.setProperty(Constants.INVITED_ATTENDEES_PARAM, invitedAttendees);
    eventEntity.setProperty(Constants.GOING_ATTENDEES_PARAM, goingAttendees);
    eventEntity.setProperty(Constants.NOT_GOING_ATTENDEES_PARAM, notGoingAttendees);
    eventEntity.setProperty(Constants.CREATOR_PARAM, currentUserID);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(eventEntity);

    json.put("success", "true");
    json.put("bad-time", "false");
  }
}
