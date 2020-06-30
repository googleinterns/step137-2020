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

@WebServlet("/events")
public class EventServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String eventName = request.getParameter("event-name");
    String startDate = request.getParameter("start-date");
    String startTime = request.getParameter("start-time");
    String endDate = request.getParameter("end-date");
    String endTime = request.getParameter("end-time");
    String eventDetails = request.getParameter("event-details");
    String yesCOVIDSafe = request.getParameter("yesCOVIDSafe");
    String eventPrivacy = request.getParameter("privacy");
    String attendees = request.getParameter("attendees");
    
    Entity eventEntity = new Entity("Event");
    eventEntity.setProperty("event-name", eventName);
    eventEntity.setProperty("start-date", startDate);
    eventEntity.setProperty("start-time", startTime);
    eventEntity.setProperty("event-details", eventDetails);
    eventEntity.setProperty("yes-COVID-Safe", yesCOVIDSafe);
    eventEntity.setProperty("privacy", eventPrivacy);
    eventEntity.setProperty("attendees", attendees);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(eventEntity);

    response.sendRedirect("/CreateAnEvent.html");
  }
}
