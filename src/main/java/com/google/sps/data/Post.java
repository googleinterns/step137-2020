package com.google.sps.data;

import com.google.appengine.api.blobstore.BlobKey;
import java.util.List;

public final class Post implements Comparable<Post>{
  private long id;
  private String caption;
  private BlobKey blobKey;
  private String creator;
  private String location;
  private String placeId;
  private String privacy;
  private List<String> likes;

  public Post(PostBuilder builder) {
    this.id = builder.id;
    this.caption = builder.caption;
    this.blobKey = builder.blobKey;
    this.creator = builder.creator;
    this.location = builder.location;
    this.placeId = builder.placeId;
    this.privacy = builder.privacy;
    this.likes = builder.likes;
  }

  @Override
  public int compareTo(Post p) {
    return Integer.compare(p.likes.size(), this.likes.size());  
  }

  public static class PostBuilder {
    private long id;
    private String caption;
    private BlobKey blobKey;
    private String creator;
    private String location;
    private String placeId;
    private String privacy;
    private List<String> likes;

    public PostBuilder (long id) {
      this.id = id;
    }

    public PostBuilder setCaption (String caption) {
      this.caption = caption;
      return this;
    }

    public PostBuilder setBlobKey (BlobKey blobKey) {
      this.blobKey = blobKey;
      return this;
    }

    public PostBuilder setCreator (String creator) {
      this.creator = creator;
      return this;
    }

    public PostBuilder setLocation (String location) {
      this.location = location;
      return this;
    }

    public PostBuilder setPlaceId (String placeId) {
      this.placeId = placeId;      
      return this;
    }

    public PostBuilder setPrivacy (String privacy) {
      this.privacy = privacy;      
      return this;
    }

    public PostBuilder setLikes (List<String> likes) {
      this.likes = likes;
      return this;
    }

    public Post build() {
      return new Post(this);
    }
  }
}