package com.google.sps.servlets;
 
import com.google.appengine.api.blobstore.BlobInfo;
import com.google.appengine.api.blobstore.BlobInfoFactory;
import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;
import com.google.appengine.api.images.ServingUrlOptions;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.Constants;
import com.google.sps.data.Post;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Collections;
import java.util.Map;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
 
/**
 * When the user submits the form, Blobstore processes the file upload and then forwards the request
 * to this servlet. This servlet can then process the request using the file URL we get from
 * Blobstore.
 */
@WebServlet("/post")
public class PostsServlet extends HttpServlet {
 
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String caption = request.getParameter(Constants.CAPTION_PARAM);
    BlobKey blobKey = getBlobKey(request, Constants.IMAGE_INPUT_PARAM);
    String location = request.getParameter(Constants.LOCATION_PARAM);
    String placeId = request.getParameter(Constants.PLACE_ID_PARAM);
    String privacy = request.getParameter(Constants.PRIVACY_PARAM);
    
    UserService userService = UserServiceFactory.getUserService();
    String creator = userService.getCurrentUser().getUserId();

    List<String> likes = new ArrayList<>();
    likes.add(""); //empty entry so the list cannot become a null entity;

    Entity postEntity = new Entity(Constants.POST_ENTITY_PARAM);
    postEntity.setProperty(Constants.CAPTION_PARAM, caption);
    postEntity.setProperty(Constants.BLOB_KEY_PARAM, blobKey);
    postEntity.setProperty(Constants.LOCATION_PARAM, location);
    postEntity.setProperty(Constants.PLACE_ID_PARAM, placeId);
    postEntity.setProperty(Constants.PRIVACY_PARAM, privacy);
    postEntity.setProperty(Constants.CREATOR_PARAM, creator);
    postEntity.setProperty(Constants.LIKES_PARAM, likes);
 
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(postEntity);

    response.sendRedirect("/posts.html");
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
     Query query = new Query(Constants.POST_ENTITY_PARAM);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);
 
     // Converting the list of entities to a list of posts .
    List<Post> posts = new ArrayList<>();
    for (Entity entity : results.asIterable()) {
      long id = entity.getKey().getId();
      String caption = (String) entity.getProperty(Constants.CAPTION_PARAM);
      BlobKey blobKey = (BlobKey) entity.getProperty(Constants.BLOB_KEY_PARAM);
      String location = (String) entity.getProperty(Constants.LOCATION_PARAM);
      String placeId = (String) entity.getProperty(Constants.PLACE_ID_PARAM);
      String privacy = (String) entity.getProperty(Constants.PRIVACY_PARAM);
      String creator = (String) entity.getProperty(Constants.CREATOR_PARAM);
      List<String> likes = (List<String>) entity.getProperty(Constants.LIKES_PARAM);

      Post post = new Post.PostBuilder(id)
          .setCaption(caption)
          .setBlobKey(blobKey)
          .setCreator(creator) 
          .setLocation(location)
          .setPlaceId(placeId)
          .setPrivacy(privacy)
          .setLikes(likes)
          .build();
      posts.add(post);
    }

    Collections.sort(posts);
    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(posts));
  }


  private BlobKey getBlobKey(HttpServletRequest request, String formInputElementName) {
    BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
    Map<String, List<BlobKey>> blobs = blobstoreService.getUploads(request);
    List<BlobKey> blobKeys = blobs.get(formInputElementName);

    if (blobKeys == null || blobKeys.isEmpty()) {
      return null;
    } 
    else {
      return blobKeys.get(0);
    }
  } 
}
