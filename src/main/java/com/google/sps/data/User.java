package com.google.sps.data;

import com.google.appengine.api.blobstore.BlobKey;
import java.util.List;

/** A user associated with the site. */
public final class User {
  private final String id;
  private final String name;
  private final List<String> buddies;
  private final List<String> buddyRequests;
  private final BlobKey blobKey;
  private final String blobKeyString;

  public User(String id, String name, List<String> buddies, 
      List<String> buddyRequests, BlobKey blobKey, String blobKeyString) {
    this.id = id;
    this.name = name;
    this.buddies = buddies;
    this.buddyRequests = buddyRequests;
    this.blobKey = blobKey;
    this.blobKeyString = blobKeyString;
  }
}
