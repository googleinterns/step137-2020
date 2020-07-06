package com.google.sps.data;

import java.util.List;

/** A user associated with the site. */
public final class User {
  private final String id;
  private final String name;
  private final List<String> interests;

  public User(String id, String name, List<String> interests) {
    this.id = id;
    this.name = name;
    this.interests = interests;
  }
}
