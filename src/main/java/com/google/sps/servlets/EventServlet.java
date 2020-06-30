package com.google.sps.servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.Constants;

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
    String attendees = request.getParameter(Constants.ATTENDEES_PARAM);

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
}
