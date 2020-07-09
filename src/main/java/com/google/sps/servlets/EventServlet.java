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
import java.time.format.DateTimeFormatter;
import java.util.Date;
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

    //create dates from input
    Date startDate = createDate(requestStartDate.substring(0, 4),
          requestStartDate.substring(5, 7), requestStartDate.substring(8)); 
    Date endDate = createDate(requestEndDate.substring(0, 4), 
          requestEndDate.substring(5, 7), requestEndDate.substring(8));
    
    JSONObject json = new JSONObject();
    boolean goodDateTimes = verifyDateTimes(requestStartTime, requestEndTime, 
                                            startDate, endDate, json);
    if (goodDateTimes) {
      createEntity(request, endDate, startDate, json, requestStartTime,
                   requestEndTime);  
    }

    response.setContentType("application/json;");
    response.getWriter().println(json);
  }


  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
 
    Query query = new Query(Constants.EVENT_ENTITY_PARAM);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);
 
     //converting the list of entities to a list of events 
    List<Event> events = new ArrayList<>();
    for (Entity entity : results.asIterable()) {

      String eventName = 
          (String) entity.getProperty(Constants.EVENT_NAME_PARAM);
      Date startDate = 
          (Date) entity.getProperty(Constants.START_DATE_PARAM);
      Date endDate = 
          (Date) entity.getProperty(Constants.END_DATE_PARAM);
      String location = 
          (String) entity.getProperty(Constants.LOCATION_PARAM);
      String eventDetails = 
          (String) entity.getProperty(Constants.EVENT_DETAILS_PARAM);
      String privacy = 
          (String) entity.getProperty(Constants.PRIVACY_PARAM);
      String yesCOVIDSafe = 
          (String) entity.getProperty(Constants.COVID_SAFE_PARAM);
      List<String> attendees = 
          (List<String>) entity.getProperty(Constants.ATTENDEES_PARAM);
      String creator = 
          (String) entity.getProperty(Constants.CREATOR_PARAM);

      Event event = new Event(eventName, startDate, endDate, location, 
                          eventDetails, yesCOVIDSafe, privacy, attendees, creator);
      events.add(event);
    }

    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(events));

  }

  private Date createDate(String year, String month, String day) {
    String dateString = month + "-" + day + "-" + year;
    SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyyy");  
    Date date = new Date();
    try {  
      date = formatter.parse(dateString);  
    } catch (ParseException e) {e.printStackTrace();}  
    return date;
  } 

  private void createEntity(HttpServletRequest request, Date endDate, Date startDate, 
          JSONObject json, String startTime, String endTime) {
    String eventName = request.getParameter(Constants.EVENT_NAME_PARAM);
    String location = request.getParameter(Constants.LOCATION_PARAM);
    String eventDetails = request.getParameter(Constants.EVENT_DETAILS_PARAM);
    String yesCOVIDSafe = request.getParameter(Constants.COVID_SAFE_PARAM);
    String privacy = request.getParameter(Constants.PRIVACY_PARAM);
    String attendeesString = request.getParameter(Constants.ATTENDEES_PARAM);
    List<String> attendees = Arrays.asList(attendeesString.split("\\s*,\\s*"));
    UserService userService = UserServiceFactory.getUserService();
    String currentUserID = userService.getCurrentUser().getUserId();
    
    Entity eventEntity = new Entity(Constants.EVENT_ENTITY_PARAM);

    eventEntity.setProperty(Constants.EVENT_NAME_PARAM, eventName);
    eventEntity.setProperty(Constants.START_DATE_PARAM, startDate);
    eventEntity.setProperty(Constants.START_TIME_PARAM, startTime);
    eventEntity.setProperty(Constants.END_DATE_PARAM, endDate);
    eventEntity.setProperty(Constants.END_TIME_PARAM, endTime);
    eventEntity.setProperty(Constants.LOCATION_PARAM, location);
    eventEntity.setProperty(Constants.EVENT_DETAILS_PARAM, eventDetails);
    eventEntity.setProperty(Constants.COVID_SAFE_PARAM, yesCOVIDSafe);
    eventEntity.setProperty(Constants.PRIVACY_PARAM, privacy);
    eventEntity.setProperty(Constants.ATTENDEES_PARAM, attendees);
    eventEntity.setProperty(Constants.CREATOR_PARAM, currentUserID);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(eventEntity);

    json.put("success", "true");
    json.put("bad-time", "false");
  }

  private boolean verifyDateTimes (String startTime, String endTime, Date startDate,
                            Date endDate, JSONObject json) {

    //collet hour and minute of requested times for comparison
    String oldHourStart;
    String oldHourEnd;
    int correctedStartHour;
    int correctedEndHour;
    int hourStart;
    int hourEnd;
    int hourStartForDisplay;
    int hourEndForDisplay;
    
    if (startTime.charAt(0) == 0) {
      oldHourStart = startTime.substring(1, 2);
      hourStart = Integer.parseInt(oldHourStart);
      hourStartForDisplay = hourStart - 12;
    }
    else {
      oldHourStart = startTime.substring(0, 2);
      hourStart = Integer.parseInt(oldHourStart);
    }
    if (endTime.charAt(0) == 0) {
      oldHourEnd = endTime.substring(1, 2);
      hourEnd = Integer.parseInt(oldHourEnd);
      hourEndForDisplay = hourEnd - 12;
    }
    else {
      oldHourEnd = endTime.substring(0, 2);
      hourEnd = Integer.parseInt(oldHourEnd);
    }

    //convert string times into integers for comparison
    int startMin = Integer.parseInt(startTime.substring(3));
    int endMin = Integer.parseInt(endTime.substring(3));
    
    if (endDate.before(startDate)) {
      json.put("bad-time", "true");
      return false;
    }
    else if (startDate.equals(endDate)) {
      //compare hours and minutes to make sure end is after start
      if (hourStart > hourEnd) {
        json.put("bad-time", "true");
        return false;
      }  
      else if (hourStart == hourEnd) {
        if (endMin <= startMin) {
          json.put("bad-time", "true");
          return false;
        }
        else {
          return true;
        }
      }
    }
    return true;  
  }
}
