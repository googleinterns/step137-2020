package com.google.sps.data;

import java.util.List;

/** A user associated with the site. */
public final class User {
  private final String id;
  private final String name;
  private final List<String> buddies;
  private final List<String> buddyRequests;

  public User(String id, String name, List<String> buddies, List<String> buddyRequests) {
    this.id = id;
    this.name = name;
    this.buddies = buddies;
    this.buddyRequests = buddyRequests;
  }
}
