package com.google.sps.data;

import java.util.List;

/** A saved location interest. */
public final class Interest {
  private final String placeId;
  private final String locationName;
  private final List<String> interestedUsers;

  public Interest(String placeId, String locationName, List<String> interestedUsers) {
    this.placeId = placeId;
    this.locationName = locationName;
    this.interestedUsers = interestedUsers;
  }
}
