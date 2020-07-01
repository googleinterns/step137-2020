package com.google.sps.servlets;

import com.google.sps.data.Constants;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/profile")
public class ProfileServlet extends HttpServlet {
  private String id;

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    id = request.getParameter(Constants.USER_ID_PARAM);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html");
    response.getWriter().println(id);
  }
}
