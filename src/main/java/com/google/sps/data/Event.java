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

    public EventBuilder setRsvpAttendees (List<String> rsvpAttendees) {
      this.rsvpAttendees = rsvpAttendees;
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
