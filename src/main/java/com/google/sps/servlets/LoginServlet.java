package com.google.sps.servlets;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.*;
import com.google.sps.data.Constants;
import java.io.IOException;
import java.lang.StringBuilder;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    Boolean loginStatus = userService.isUserLoggedIn();

    StringBuilder jsonBuilder = new StringBuilder("{");
    buildJson(jsonBuilder, Constants.LOGIN_STATUS_PARAM, loginStatus.toString());

    // If the user is logged in, add the logout url and the user ID to the json.
    if (loginStatus) {
      String logoutUrl = userService.createLogoutURL("/");
      String userId = userService.getCurrentUser().getUserId();
      buildJson(jsonBuilder, Constants.LOGOUT_URL_PARAM, logoutUrl);
      buildJson(jsonBuilder, Constants.USER_ID_PARAM, userId);

    // If the user is logged out, add the login url to the json.
    } else {
      String loginUrl = userService.createLoginURL("/");
      buildJson(jsonBuilder, Constants.LOGIN_URL_PARAM, loginUrl);
    }

    // Fix the json end formatting and convert the StringBuilder to a String.
    jsonBuilder.delete(jsonBuilder.length() - 2, jsonBuilder.length());
    jsonBuilder.append("}");
    String json = jsonBuilder.toString();

    response.setContentType("application/json");
    response.getWriter().println(json);
  }

  /** Adds a String parameter and String value to the specified JSON StringBuilder. */
  private void buildJson(StringBuilder builder, String paramName, String paramValue) {
    builder.append("\"");
    builder.append(paramName);
    builder.append("\": \"");
    builder.append(paramValue);
    builder.append("\", ");
  }
}
