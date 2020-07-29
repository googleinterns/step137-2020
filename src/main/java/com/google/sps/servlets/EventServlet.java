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

    Date startDateTime = parseInputDateTime(requestStartDate, requestStartTime, timeZone);
    Date endDateTime = parseInputDateTime(requestEndDate, requestEndTime, timeZone);
    // Create dates without times for event currency comparison.
    Date startDate = parseInputDate(requestStartDate);
    Date endDate = parseInputDate(requestEndDate);
    
    JSONObject json = new JSONObject();
    boolean goodDateTimes = verifyDateTimes(startDateTime, endDateTime, json);
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
    Query query = new Query(Constants.EVENT_ENTITY_PARAM)
              .addSort(Constants.DATE_TIME_PARAM, SortDirection.DESCENDING);
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

/**
  HTML Date inputs return a String in the form: yyyy/mm/dd.
  In order to use that for comparison purposes, the String needs to be parsed 
  into a Date, which requires taking substrings of the year, month, and day of
  the inputted date String. 

  input.substring(0, 4) should return the yyyy element of the input.
  input.substrng(5, 7) should return the mm element of the input.
  input.substring(8) should return the dd element of the input.

  Using these pieces of the input the date can be parsed and formatted as desired.
*/
  private Date parseInputDateTime(String inputDate, String time, String timeZone) {
    String year = inputDate.substring(0, 4);
    String month = inputDate.substring(5, 7);
    String day = inputDate.substring(8);

    return createDateTime(year, month, day, time, timeZone);
  }

  private Date parseInputDate(String inputDate) {
    String year = inputDate.substring(0, 4);
    String month = inputDate.substring(5, 7);
    String day = inputDate.substring(8);

    return createDate(year, month, day);
  }

/** Turns inputted strings into a date.*/
  private Date createDate(String year, String month, String day) {
    String dateString = month + "-" + day + "-" + year;
    SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyyy");
    Date dateTime = new Date();
    try {
      dateTime = formatter.parse(dateString);
    } catch (ParseException e) {e.printStackTrace();}
    return dateTime;
  }

/** Turns inputted strings into date time. */
  private Date createDateTime(String year, String month, String day, 
            String time, String timeZone) {
    String dateString = month + "-" + day + "-" + year + " " + time + " " + timeZone;
    SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyyy HH:mm z");
    formatter.setTimeZone(TimeZone.getTimeZone(timeZone));
    Date dateTime = new Date();
    try {
      dateTime = formatter.parse(dateString);
    } catch (ParseException e) {e.printStackTrace();}
    return dateTime;
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
    String startTimeFormatted = getTimeDisplay(startTime);
    String endTimeFormatted = getTimeDisplay(endTime);
    
    // Get formatted dates and times for display.
    String dateTimeFormatted = createDateTimeDisplay(startDate, startTimeFormatted, 
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

/**
  if event is finished in one day, date display should be:
      EEE MMM dd, yyyy, startTime - endTime
  if the event ends on a different day than it starts:
      EEE MM Mdd, yyyy, startTime - EEE MMM dd, yyyy, endTime

*/
  private String createDateTimeDisplay(Date startDate, String startTime, Date endDate,
                                String endTime, String timeZone) {
    String dateTime = "";
    String dateString;
    SimpleDateFormat formatter = new SimpleDateFormat("EEE MMM dd, yyyy"); 

    if (startDate.equals(endDate)) {
      dateString = formatter.format(startDate);
      dateTime += dateString + ", " + startTime + " - " + endTime + " " + 
                  timeZone;
    }
    else {
      String startDateString = formatter.format(startDate);
      String endDateString = formatter.format(endDate);
      dateTime += startDateString + ", " + startTime + " - " + endDateString;
      dateTime += ", " + endTime + " " + timeZone;
    }

    return dateTime;
  }

/** Make sure the inputted dates and times are valid. */
  private boolean verifyDateTimes (Date startDate, Date endDate, JSONObject json) {
    if (endDate.before(startDate) || endDate.equals(startDate)) {
      json.put("bad-time", "true");
      return false;
    }
    return true;
  }

/**
  Gets start and end times for display purposes -- converts times after 12 to standard
  as opposed to military (i.e 13 to 1)
*/
  private String getTimeDisplay(String time) {
    String oldHour;
    int hour;
    String hourForDisplay;
    String period;
    int firstChar = Integer.parseInt(time.substring(0, 1));
    int firstTwoChars = Integer.parseInt(time.substring(0, 2));

    if (firstChar == 0 && firstTwoChars != 00) {
      hourForDisplay = time.substring(1, 2);
      period = "am";
    }
    else if (firstTwoChars == 00) {
      hourForDisplay = "12";
      period = "am";
    }
    else if (firstTwoChars == 10 || firstTwoChars == 11) {
      hourForDisplay = String.valueOf(firstTwoChars);
      period = "am";
    }
    else if (firstTwoChars == 12) {
      hourForDisplay = String.valueOf(firstTwoChars);
      period = "pm";
    }
    else {
      oldHour = time.substring(0, 2);
      hour = Integer.parseInt(oldHour);
      int hourForDisplayInt = hour - 12;
      hourForDisplay = String.valueOf(hourForDisplayInt);
      period = "pm";
    }

    String min = time.substring(3);
    hourForDisplay += ":" + min + period;

    return hourForDisplay;
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
