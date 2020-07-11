package com.google.sps.data;
import java.util.List;
import java.util.Date;

public final class Event {
  private long eventId;
  private String eventName;
  private Date startDate;
  private Date endDate;
  private String location;
  private String eventDetails;
  private String yesCOVIDSafe;
  private String privacy;
  private List<String> invitedAttendees;
  private List<String> rsvpAttendees;
  private String creator;

  public Event(long eventId, String eventName, Date startDate, Date endDate, 
              String location, String eventDetails, String yesCOVIDSafe, 
              String privacy, List<String> invitedAttendees, 
              List<String> rsvpAttendees, String creator) {

    this.eventId = eventId;
    this.eventName = eventName;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.eventDetails = eventDetails;
    this.yesCOVIDSafe = yesCOVIDSafe;
    this.privacy = privacy;
    this.invitedAttendees = invitedAttendees;
    this.rsvpAttendees = rsvpAttendees;
    this.creator = creator;
  }
}
