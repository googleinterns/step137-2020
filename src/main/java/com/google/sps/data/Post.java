package com.google.sps.data;

import com.google.appengine.api.blobstore.BlobKey;

public final class Post {
  private long id;
  private String caption;
  private BlobKey blobKey;
  private String creator;
  private String location;
  private String placeId;

  public Post(PostBuilder builder) {
    this.id = builder.id;
    this.caption = builder.caption;
    this.blobKey = builder.blobKey;
    this.creator = builder.creator;
    this.location = builder.location;
    this.placeId = builder.placeId;
  }

  public static class PostBuilder {
    private long id;
    private String caption;
    private BlobKey blobKey;
    private String creator;
    private String location;
    private String placeId;

    public PostBuilder(
        long id, 
        String caption, 
        BlobKey blobKey, 
        String creator, 
        String location, 
        String placeId) {
      this.id = id;
      this.caption = caption;
      this.blobKey = blobKey;
      this.creator = creator;
      this.location = location;
      this.placeId = placeId;
    }

    public Post build() {
      return new Post(this);
    }
  }
}