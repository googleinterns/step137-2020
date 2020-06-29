package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
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

    String json = "{";
    json += "\"loginStatus\": \"" + loginStatus + "\", ";

    if (loginStatus) {
      String logoutUrl = userService.createLogoutURL("/");
      json += "\"logoutUrl\": \"" + logoutUrl + "\"}";
    } else {
      String loginUrl = userService.createLoginURL("/");
      json += "\"loginUrl\": \"" + loginUrl + "\"}";
    }

    response.setContentType("application/json");
    response.getWriter().println(json);
  }
}
