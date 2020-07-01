package com.google.sps.data;

/** A user associated with the site. */
public final class User {
  private final String id;
  private final String name;

  public User(String id, String name) {
    this.id = id;
    this.name = name;
  }
}
