package com.google.sps.data;
import java.util.List;
import java.util.Date;

public class Event implements Comparable<Event> {
  private long eventId;
  private String eventName;
  // Start/end date/time represented in a string
  private String dateTime;
  // Original request date/time strings for when user wants to edit their event
  private String startDate;
  private String startTime;
  private String endDate;
  private String endTime;
  private String timeZone;
  // Start date/time for sorting
  private Date startDateTime;
  private String location;
  private String placeId;
  private String eventDetails;
  private String yesCOVIDSafe;
  private String privacy;
  private List<String> invitedAttendees;
  private List<String> goingAttendees;
  private List<String> notGoingAttendees;
  private String creator;
  private String currency;

  public Event(EventBuilder builder) {
    this.eventId = builder.eventId;
    this.eventName = builder.eventName;
    this.dateTime = builder.dateTime;
    this.startDate = builder.startDate;
    this.startTime = builder.startTime;
    this.endDate = builder.endDate;
    this.endTime = builder.endTime;
    this.timeZone = builder.timeZone;
    this.startDateTime  = builder.startDateTime;
    this.location = builder.location;
    this.placeId = builder.placeId;
    this.eventDetails = builder.eventDetails;
    this.yesCOVIDSafe = builder.yesCOVIDSafe;
    this.privacy = builder.privacy;
    this.invitedAttendees = builder.invitedAttendees;
    this.goingAttendees = builder.goingAttendees;
    this.notGoingAttendees = builder.notGoingAttendees;
    this.creator = builder.creator;
    this.currency = builder.currency;
  }


  public Date getDateTime() {
    return startDateTime;
  }

  @Override
  public int compareTo(Event e) {
    return getDateTime().compareTo(e.getDateTime());
  }

  public static class EventBuilder {

    private long eventId;
    private String eventName;
    // String of the date and time of event for display purposes.
    private String dateTime;
    private String startDate;
    private String startTime;
    private String endDate;
    private String endTime;
    private String timeZone;
    // Start date of event for sorting comparison (displaying events by start date).
    private Date startDateTime;
    private String location;
    private String placeId;
    private String eventDetails;
    private String yesCOVIDSafe;
    private String privacy;
    private List<String> invitedAttendees;
    private List<String> goingAttendees;
    private List<String> notGoingAttendees;
    private String creator;
    private String currency;

    public EventBuilder (long eventId) {
      this.eventId = eventId;
    }

    public EventBuilder setEventName (String eventName) {
      this.eventName = eventName;
      return this;
    }

    public EventBuilder setDateTime (String dateTime) {
      this.dateTime = dateTime;
      return this;
    }

    public EventBuilder setStartDate (String startDate) {
      this.startDate = startDate;
      return this;
    }

    public EventBuilder setStartTime (String startTime) {
      this.startTime = startTime;
      return this;
    }

    public EventBuilder setEndDate (String endDate) {
      this.endDate = endDate;
      return this;
    }


    public EventBuilder setEndTime (String endTime) {
      this.endTime = endTime;
      return this;
    }

    public EventBuilder setTimeZone (String timeZone) {
      this.timeZone = timeZone;
      return this;
    }

    public EventBuilder setStartDateTime (Date startDateTime) {
      this.startDateTime = startDateTime;
      return this;
    }

    public EventBuilder setLocation (String location) {
      this.location = location;
      return this;
    }

    public EventBuilder setPlaceId (String placeId) {
      this.placeId = placeId;
      return this;
    }

    public EventBuilder setEventDetails (String eventDetails) {
      this.eventDetails = eventDetails;
      return this;
    }

    public EventBuilder setYesCOVIDSafe (String yesCOVIDSafe) {
      this.yesCOVIDSafe = yesCOVIDSafe;
      return this;
    }

    public EventBuilder setPrivacy (String privacy) {
      this.privacy = privacy;
      return this;
    }

    public EventBuilder setInvitedAttendees (List<String> invitedAttendees) {
      this.invitedAttendees = invitedAttendees;
      return this;
    }

    public EventBuilder setGoingAttendees (List<String> goingAttendees) {
      this.goingAttendees = goingAttendees;
      return this;
    }


    public EventBuilder setNotGoingAttendees (List<String> notGoingAttendees) {
      this.notGoingAttendees = notGoingAttendees;
      return this;
    }

    public EventBuilder setCreator (String creator) {
      this.creator = creator;
      return this;
    }

    public EventBuilder setCurrency (String currency) {
      this.currency = currency;
      return this;
    }

    public Event build() {
      return new Event(this);
    } 
  }
}
