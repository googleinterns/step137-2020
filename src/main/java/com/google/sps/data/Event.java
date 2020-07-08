package com.google.sps.data;
import java.util.List;
import java.util.Date;

public final class Event {
  private String eventName;
  private Date startDate;
  private Date endDate;
  private String location;
  private String eventDetails;
  private String yesCOVIDSafe;
  private String privacy;
  private List<String> attendees;
  private String creator;

  public Event(String eventName, Date startDate, Date endDate, 
              String location, String eventDetails, String yesCOVIDSafe, 
              String privacy, List<String> attendees, String creator) {

    this.eventName = eventName;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.eventDetails = eventDetails;
    this.yesCOVIDSafe = yesCOVIDSafe;
    this.privacy = privacy;
    this.attendees = attendees;
    this.creator = creator;
  }
}
