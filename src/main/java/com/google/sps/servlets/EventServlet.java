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

@WebServlet("/events")
public class EventServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String eventName = request.getParameter(Constants.EVENT_NAME_PARAM);
    String startDate = request.getParameter(Constants.START_DATE_PARAM);
    String startTime = request.getParameter(Constants.START_TIME_PARAM);
    String endDate = request.getParameter(Constants.END_DATE_PARAM);
    String endTime = request.getParameter(Constants.END_TIME_PARAM);
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

    response.sendRedirect("/CreateAnEvent.html");
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    String currentUserID = userService.getCurrentUser().getUserId();
    String currentUserName = getUserName(userService.getCurrentUser().getUserId());
 
    Query query = new Query(Constants.EVENT_ENTITY_PARAM)
                      .addSort(Constants.START_TIME_PARAM, SortDirection.ASCENDING);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);
 
    List<Entity> applicableEvents = new ArrayList<>();
    for (Entity entity : results.asIterable()) {
      String privacy = (String) entity.getProperty(Constants.PRIVACY_PARAM);
      if (privacy == "public") {
        applicableEvents.add(entity);
      }
 /*
   This will be implemented when buddy list functionaliy becomes available

      else if (privacy == "buddies-only") {
        Query userQuery = new Query(Constants.USER_ENTITY_PARAM)
        DatastoreService userDataStore = DatastoreServiceFactory.getDatastoreService();
        PreparedQuery userResults = datastore.prepare(userQuery);
 
        //get creator of event ID
        String creatorID = entity.getProperty(Constants.CREATOR_PARAM);
        //check if current user is in creators buddy list
        for (Entity userEntity : userResults.asIterable()) {
          if (userEntity.getProperty(Constants.USER_ID_PARAM) == creatorID) {
            List<String> userBuddies = userEntity.getProperty(BUDDIES_PROPERTY);
            if (userBuddies.contains(currentUserID) {
              applicableEvents.add(entity);
              break;
            }
          }
        }
      }
  */
 
      else if (privacy == "attendees") {
        List<String> attendees = (List<String>) entity.getProperty(Constants.ATTENDEES_PARAM);
        if (attendees.contains(currentUserName)) {
          applicableEvents.add(entity);
        }
      }
    }

    //converting the list of entities to a list of events 
    List<Event> events = new ArrayList<>();
    for (int i = 0; i < applicableEvents.size(); ++i) {
      String eventName = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.EVENT_NAME_PARAM);
      String startDate = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.START_DATE_PARAM);
      String startTime =  
          (String) applicableEvents.get(i)
              .getProperty(Constants.START_TIME_PARAM);
      String endDate = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.END_DATE_PARAM);
      String endTime = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.END_TIME_PARAM);
      String location = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.LOCATION_PARAM);
      String eventDetails = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.EVENT_DETAILS_PARAM);
      String privacy = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.PRIVACY_PARAM);
      String yesCOVIDSafe = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.COVID_SAFE_PARAM);
      List<String> attendees = 
          (List<String>) applicableEvents.get(i)
              .getProperty(Constants.ATTENDEES_PARAM);
      String creator = 
          (String) applicableEvents.get(i)
              .getProperty(Constants.CREATOR_PARAM);

      Event event = new Event(eventName, startDate, startTime, endDate, endTime,
                          location, eventDetails, yesCOVIDSafe, privacy, 
                          attendees, creator);
      events.add(event);
    }

 
    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(events));

  }

  /** Returns the name of the user or an empty string if they do not yet have one. */
  private String getUserName(String id) {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query(Constants.USER_ENTITY_PARAM)
        .setFilter(new Query.FilterPredicate(Constants.USER_ID_PARAM, Query.FilterOperator.EQUAL, id));
    PreparedQuery results = datastore.prepare(query);
    Entity userEntity = results.asSingleEntity();
    String name = "";
    if (userEntity != null) {
      name = (String) userEntity.getProperty(Constants.USER_NAME_PARAM);
    }
    return name;
  }
}
