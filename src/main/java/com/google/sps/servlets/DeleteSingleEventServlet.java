package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.sps.data.Constants;

/** Servlet responsible for deleting single events. */
@WebServlet("/delete-single-event")
public class DeleteSingleEventServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));

    Key eventEntityKey = KeyFactory.createKey(Constants.EVENT_ENTITY_PARAM, id);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.delete(eventEntityKey);
  }
}
