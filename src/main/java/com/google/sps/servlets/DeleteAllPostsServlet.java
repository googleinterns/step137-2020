package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.blobstore.BlobKey;
import java.io.IOException;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.sps.data.Constants;

/** Servlet responsible for deleting posts. */
@WebServlet("/delete-all-posts")
public class DeleteAllPostsServlet extends HttpServlet {

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(Constants.POST_ENTITY_PARAM);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    BlobstoreService blobstore = BlobstoreServiceFactory.getBlobstoreService();

    for (Entity entity : results.asIterable()) {
      long id = entity.getKey().getId();
      BlobKey blobkey = (BlobKey) entity.getProperty(Constants.BLOB_KEY_PARAM);

      Key postEntityKey = KeyFactory.createKey(Constants.POST_ENTITY_PARAM, id);
      datastore.delete(postEntityKey);
      blobstore.delete(blobkey);
    }

    response.setContentType("text/html;");
    response.getWriter().println("");
  }
}
