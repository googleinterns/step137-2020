package com.google.sps.data;
import java.util.List;

public final class Event {
  private String eventName;
  private String startDate;
  private String startTime;
  private String endDate;
  private String endTime;
  private String location;
  private String eventDetails;
  private String yesCOVIDSafe;
  private String privacy;
  private List<String> attendees;
  private String creator;

  public Event(String eventName, String startDate, String startTime, String endDate, 
              String endTime, String location, String eventDetails, 
              String yesCOVIDSafe, String privacy, List<String> attendees, 
              String creator) {

    this.eventName = eventName;
    this.startDate = startDate;
    this.startTime = startTime;
    this.endDate = endDate;
    this.endTime = endTime;
    this.location = location;
    this.eventDetails = eventDetails;
    this.yesCOVIDSafe = yesCOVIDSafe;
    this.privacy = privacy;
    this.attendees = attendees;
    this.creator = creator;
  }
}