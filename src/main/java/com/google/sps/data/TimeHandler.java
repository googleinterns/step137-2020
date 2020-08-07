package com.google.sps.data;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.text.ParseException; 
import org.json.JSONObject;

public class TimeHandler {
  /**
  HTML Date inputs return a String in the form: yyyy-mm-dd.
  In order to use that for comparison purposes, the String needs to be parsed 
  into a Date, which requires splitting the String at "-" to separate the 
  year, month, and day into separate String variables

  Using these pieces of the input the date can be parsed and formatted as desired.
*/

  public static Date parseInputDateTime(String inputDate, String time, String timeZone, 
      JSONObject json) {
    String[] splitString = inputDate.split("-");
    String year = splitString[0];
    if (Integer.parseInt(year) > 5000) {
      json.put("weird-year", year);
    }
    else {
      json.put("weird-year", "no");
    }
    String month = splitString[1];
    String day = splitString[2];

    return createDateTime(year, month, day, time, timeZone);
  }

  public static Date parseInputDate(String inputDate, JSONObject json) {
    String[] splitString = inputDate.split("-");
    String year = splitString[0];
    String month = splitString[1];
    String day = splitString[2];

    return createDate(year, month, day);
  }

/** Turns inputted strings into a date.*/
  public static Date createDate(String year, String month, String day) {
    String dateString = month + "-" + day + "-" + year;
    SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyyy");
    Date dateTime = new Date();
    try {
      dateTime = formatter.parse(dateString);
    } catch (ParseException e) {e.printStackTrace();}
    return dateTime;
  }

/** Turns inputted strings into date time. */
  public static Date createDateTime(String year, String month, String day, 
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

  /**
  if event is finished in one day, date display should be:
      EEE MMM dd, yyyy, startTime - endTime
  if the event ends on a different day than it starts:
      EEE MM Mdd, yyyy, startTime - EEE MMM dd, yyyy, endTime

*/
  public static String createDateTimeDisplay(Date startDate, String startTime, Date endDate,
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
  public static boolean verifyDateTimes (Date startDate, Date endDate, JSONObject json) {
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
  public static String getTimeDisplay(String time) {
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
  public static String eventCurrency(Date endDate, String timeZone) {
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