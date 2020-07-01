package com.google.sps.data;

/** A saved location interest. */
public final class Interest {
  private final String locationId;
  private final String locationName;

  public Interest(String locationId, String locationName) {
    this.locationId = locationId;
    this.locationName = locationName;
  }
}
