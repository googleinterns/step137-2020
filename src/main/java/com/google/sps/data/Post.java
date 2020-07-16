package com.google.sps.data;

import com.google.appengine.api.blobstore.BlobKey;

public final class Post {
  private String caption;
  private BlobKey blobKey;
  private String creator;

  public Post(String caption, BlobKey blobKey, String creator) {
    this.caption = caption;
    this.blobKey = blobKey;
    this.creator = creator;
  }
}