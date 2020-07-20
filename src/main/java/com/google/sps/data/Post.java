package com.google.sps.data;

import com.google.appengine.api.blobstore.BlobKey;

public final class Post {
  private long id;
  private String caption;
  private BlobKey blobKey;
  private String creator;
  private String location;
  private String placeId;

  public Post(long id, String caption, BlobKey blobKey, String creator, 
              String location, String placeId) {
    this.id = id;
    this.caption = caption;
    this.blobKey = blobKey;
    this.creator = creator;
    this.location = location;
    this.placeId = placeId;
  }
}