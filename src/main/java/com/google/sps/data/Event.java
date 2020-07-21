package com.google.sps.data;
import java.util.List;

public final class Event {
  private long eventId;
  private String eventName;
  private String dateTime;
  private String location;
  private String placeId;
  private String eventDetails;
  private String yesCOVIDSafe;
  private String privacy;
  private List<String> invitedAttendees;
  private List<String> rsvpAttendees;
  private String creator;
  private String currency;

  public Event(EventBuilder builder) {
    this.eventId = builder.eventId;
    this.eventName = builder.eventName;
    this.dateTime = builder.dateTime;
    this.location = builder.location;
    this.placeId = builder.placeId;
    this.eventDetails = builder.eventDetails;
    this.yesCOVIDSafe = builder.yesCOVIDSafe;
    this.privacy = builder.privacy;
    this.invitedAttendees = builder.invitedAttendees;
    this.rsvpAttendees = builder.rsvpAttendees;
    this.creator = builder.creator;
    this.currency = builder.currency;
  }

  public static class EventBuilder {

    private long eventId;
    private String eventName;
    private String dateTime;
    private String location;
    private String placeId;
    private String eventDetails;
    private String yesCOVIDSafe;
    private String privacy;
    private List<String> invitedAttendees;
    private List<String> rsvpAttendees;
    private String creator;
    private String currency;

    public EventBuilder (
        long eventId, 
        String eventName, 
        String dateTime,
        String location, 
        String placeId, 
        String eventDetails, 
        String yesCOVIDSafe, 
        String privacy, 
        List<String> invitedAttendees,
        List<String> rsvpAttendees, 
        String creator, 
        String currency) {
      this.eventId = eventId;
      this.eventName = eventName;
      this.dateTime = dateTime;
      this.location = location;
      this.placeId = placeId;
      this.eventDetails = eventDetails;
      this.yesCOVIDSafe = yesCOVIDSafe;
      this.privacy = privacy;
      this.invitedAttendees = invitedAttendees;
      this.rsvpAttendees = rsvpAttendees;
      this.creator = creator;
      this.currency = currency;
    }

    public Event build() {
      return new Event(this);
    } 
  }
}
