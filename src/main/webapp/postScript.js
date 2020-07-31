function fetchBlobstoreURL() {
  fetch('/blobstore-upload-url')
      .then((response) => {
        return response.text();
      })
      .then((imageUploadUrl) => {
        const messageForm = document.getElementById('post');
        messageForm.action = imageUploadUrl;
      });
}

function getPublicPosts() {
  locationName = sessionStorage.getItem(SESSION_STORE_LOCATION);
  postDivElement = document.createElement('div');
  postDivElement.innerText = '';
  let count = 0;
  fetch('/post')
    .then(response => response.json())
    .then(posts => {
      for (let i = 0; i < posts.length; i ++) {
        if (locationName === posts[i].location &&
            posts[i].privacy === "public") {
          postDivElement.appendChild(createPostNoResponse(posts[i]));
          count++;
        }
      }
      if (count === 0) {
        noPostElement = document.createElement('p');
        noPostElement.innerText = "No posts to show.";
        postDivElement.appendChild(noPostElement);
      }
    });
  return postDivElement;
}

function getAvailablePosts(userId) {
  locationName = sessionStorage.getItem(SESSION_STORE_LOCATION);
  postDivElement = document.createElement('div');
  postDivElement.innerText = '';
  var fetchedUsers = new Array();
  let count = 0;
  fetch('/post')
    .then(response => response.json())
    .then(posts => {
      for (let i = 0; i < posts.length; i ++) {
        if (locationName === posts[i].location ) {
          if (posts[i].privacy === "public") {
            postDivElement.appendChild(createPostWithResponse(posts[i], userId));
            count++;
          }
          else if (posts[i].privacy === "buddies") {
            if (fetchedUsers.length === 0) {
              fetch('/user')
                .then(response => response.json())
                .then(users => {
                  fetchedUsers = users;
                });
            }
            fetchedUsers.forEach(function(user)  {
              if (user.id === userId) {
                if (user.buddies.includes(userId)) {
                  postDivElement.appendChild(createPostWithResponse(posts[i], userId));
                  ++count;
                }
              }
            });
          }
          else if (posts[i].privacy === "private") {
            if (posts[i].creator === userId) {
              postDivElement.appendChild(createPostWithResponse(posts[i], userId));
              ++count;
            }
          }
          else if (posts[i].creator === userId) {
            postDivElement.appendChild(createPostWithResponse(posts[i], userId));
            ++count;
          }
        }
      }
      if (count === 0) {
        noPostElement = document.createElement('p');
        noPostElement.innerText = "No posts to show.";
        postDivElement.appendChild(noPostElement);
      }
    });
  return postDivElement;
}

function createPostNoResponse(post) {
  const postElement = document.createElement('div');
  if (window.location.pathname === '/profile.html') {
    postElement.className = "post-card-profile";
  }
  else {
    postElement.className = "post-card";
  }
  postElement.id = "post-element";

  const postContents = document.createElement('div');
  postContents.className = "contents";

  const postHeader = document.createElement('div');
  postHeader.className = "top-card"
  const creator = document.createElement('div');
  creator.id = "creator";
  fetch("/user")
    .then(response => response.json())
    .then(users => {
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === post.creator) {
          displayProfilePicture(users[i], creator, 'profile-pic-small');
          const caption = document.createElement('p');
          caption.className = "details-display post-details";
          caption.innerText = post.caption;
          creator.append(caption);
          creator.addEventListener('click', () => {
            visitProfile(users[i].id);
          });
        }
      }
    });

  if (post.COVIDInfo === "yes") {
    const covidBadge = document.createElement('img');
    covidBadge.src = "images/mask.png";
    covidBadge.height = 20;
    covidBadge.width = 20;
    covidBadge.id = "covid-badge";
    postHeader.append(covidBadge);
  }

  const imageDiv = document.createElement('div');
  const imageElement = document.createElement('img');
  imageElement.id = "image";

  const params = new URLSearchParams();
  blobKey = post.blobKey;
  params.append('blobkey', Object.values(blobKey));
  fetch('/serve', {
    method: 'POST', body: params
  }).then(response => response.blob())
  .then(function(image) {
    var imageURL = URL.createObjectURL(image);
    imageElement.src = imageURL;
    imageDiv.append(imageElement);
  });

  const locationDisplay = document.createElement('div');
  locationDisplay.className = "location-display post-location";
  const locationIcon = document.createElement('i');
  locationIcon.className = 'fa fa-map-marker';
  const postLocation = document.createElement('p');
  postLocation.className = "location-name";
  postLocation.innerText = post.location;
  locationDisplay.append(locationIcon);
  locationDisplay.append(postLocation);

  if (window.location.pathname === '/profile.html') {
    locationDisplay.addEventListener('click', () => {
      sessionStorage.setItem(SESSION_STORAGE_CURRENT_LOCATION, post.placeId);
      window.location.href = 'map.html';
    });
  }
  
  postElement.append(imageDiv);
  postElement.append(postContents);
  postElement.append(locationDisplay);
  postElement.append(creator);

  return postElement;
}

function createPostWithResponse(post, userId) {
  const postElement = createPostNoResponse(post);
  const bottomCard = document.createElement('div');
  bottomCard.id = "bottom-card";
  const buttons = document.createElement('div');
  buttons.className = "post-buttons";

  if (userId === post.creator) {
    const deleteButton = document.createElement('i');
    deleteButton.id = "delete-button";
    deleteButton.className = 'fa fa-trash-o';
    deleteButton.addEventListener('click', () => {
      deleteSinglePost(post, postElement);
    });
    bottomCard.append(deleteButton);
  }

  const likeButton = document.createElement('i');
  likeButton.className = 'fa fa-heart';
  likeButton.id = "edit-event-button";
  likeButton.addEventListener('click', () => {
    likePost(post, likesCount, postElement, likesElement);
  }); 

  const likesElement = document.createElement('div');
  likesElement.id = "likes-element";
  const likesCount = document.createElement('p');
  if (post.likes.length - 1 === 1) {
    likesCount.innerText = "1 Like";
  }
  else if (post.likes.length - 1 > 0) {
    likesCount.innerText = post.likes.length - 1 + " Likes";
  }
  else {
    likesCount.innerText = "0 Likes";
  }
  likesCount.id = 'likes';
  likesElement.appendChild(likesCount);
  bottomCard.append(likesElement);

  bottomCard.append(likeButton);
  postElement.append(bottomCard);

  return postElement;
}

function likePost(post, likesCount, postElement, likesElement) {
  const params = new URLSearchParams();
  params.append("id", post.id);
  fetch('/likes', {
    method: 'POST', body: params
  }).then(response => response.json())
  .then(json => {
    var numLikes = json['count'];
    if (numLikes === 1) {
      likesCount.innerText = "1 Like";
    }
    else {
      likesCount.innerText = numLikes + " Likesuseru";
    }

    likesElement.appendChild(likesCount);
    postElement.appendChild(likesElement);
  })
}

function deleteSinglePost(post, postElement) {
  blobKey = post.blobKey;
  deleteBlob(blobKey);
  const params = new URLSearchParams();
  params.append('id', post.id);
  fetch('/delete-single-post', {
    method: 'POST', body: params
  }).then(postElement.style.display = "none")
    .then(getAvailablePosts());
}

function deleteBlob(blobkey) {
  const params = new URLSearchParams();
  params.append("blobkey", blobkey);
  fetch('/delete-blob', {
    method:'POST', body: params
  })
}

function hideForm() {
  // set sessionStorage so that the map reloads to this location
  sessionStorage.setItem("whichTabToOpen", "Posts");
  postPlaceId = sessionStorage.getItem('postPlaceId');
  sessionStorage.setItem('currentLocationId', postPlaceId);
  document.getElementById("post-form").style.display = 'none';
}

function createPostForm() {
  getLocationInfo();
  const exitButton = document.createElement('i');
  exitButton.className = 'fa fa-close';
  exitButton.addEventListener('click', () => {
    document.getElementById("post-form").style.display = 'none';
  });
  document.getElementById("exit-button").appendChild(exitButton);
}

/*
 * Confirms that the user's uploaded profile picture is a 
 * PNG, JPG, or JPEG before allowing submission.
 */
function confirmPostImageType() {
  const imageURL = document.getElementById('uploaded-image').value;
  if ((imageURL.indexOf('.jpeg') == imageURL.length - 5) || 
  (imageURL.indexOf('.jpg') == imageURL.length - 4) || 
  (imageURL.indexOf('.png') == imageURL.length - 4)) {
    document.getElementById('image-approval').style.display = 'inline-block';
    document.getElementById('image-failure').style.display = 'none';
  } else {
    document.getElementById('image-approval').style.display = 'none';
    document.getElementById('image-failure').style.display = 'inline-block';
  }
}
