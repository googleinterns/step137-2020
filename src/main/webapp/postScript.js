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
  const topOfPost = document.createElement('div');
  topOfPost.className = "top-card:"
  const creatorName = document.createElement('div');
  creatorName.id = "event-creator";
  fetch("/user")
    .then(response => response.json())
    .then(users => {
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === post.creator) {
          displayProfilePicture(users[i], creatorName, 'profile-pic-small');
          const name = document.createElement('p');
          name.id = 'event-creator-name';
          name.innerText = "Created by " + users[i].name;
          creatorName.addEventListener('click', () => {
            visitProfile(users[i].id);
          });
          creatorName.append(name);
        }
      }
    });
  
  topOfPost.append(creatorName);

  if (post.COVIDInfo === "yes") {
    const covidBadge = document.createElement('img');
    covidBadge.src = "images/mask.png";
    covidBadge.height = 20;
    covidBadge.width = 20;
    covidBadge.id = "covid-badge";
    topOfPost.append(covidBadge);
  }
  const caption = document.createElement('p');
  caption.id = "caption";
  caption.innerText = post.caption;

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
  });
  
  const postElement = document.createElement('div');
  postElement.className = "card";
  postElement.append(topOfPost);
  postElement.append(imageElement);
  postElement.append(caption);

  return postElement;
}

function createPostWithResponse(post, userId) {
  const postElement = createPostNoResponse(post);
  const bottomCard = document.createElement('div');
  bottomCard.id = "bottom-card";
  const buttons = document.createElement('div');

  if (userId === post.creator) {
    const deleteButton = document.createElement('button');
    deleteButton.className = "button icon-button";
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa fa-trash-o';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', () => {
      deleteSinglePost(post, postElement);
    });
    buttons.append(deleteButton);
  }

  const likesElement = document.createElement('div');
  likesElement.id = "likes-element";

  // need -1 to account for the empty value put in when initializing the comment
  const likesCount = document.createElement('p');
  const likesCountIcon = document.createElement('i');
  if (post.likes.length - 1 > 0) {
    likesCountIcon.className = 'fa fa-heart-o';
    likesElement.appendChild(likesCountIcon);
    likesCount.innerText = post.likes.length - 1;
    likesCount.id = 'likes';
    likesElement.appendChild(likesCount);
  } 
  
  const likesButton = document.createElement('button');
  likesButton.className = 'button icon-button';
  const likeIcon = document.createElement('i');
  likeIcon.className = 'fa fa-heart';
  likesButton.appendChild(likeIcon);
  likesButton.addEventListener('click', () => {
    likePost(post, post.likes.length - 1, likesCount, likesCountIcon, postElement, likesElement);
  }); 
  buttons.appendChild(likesButton);

  bottomCard.append(buttons);
  bottomCard.append(likesElement);
  
  postElement.className = "card";
  postElement.append(bottomCard);

  return postElement;
}

function likePost(post, numLikes, likesCount, likesCountIcon, postElement, likesElement) {
  const params = new URLSearchParams();
  params.append("id", post.id);
  fetch('/likes', {
    method: 'POST', body: params
  }).then(response => response.json())
  .then(json => {
    if (json["count"] === "decrease") {
      var newLikes = numLikes - 1;
      if (newLikes <= 0) {
        likesElement.innerText = '';
      }
      else {
        likesCount.innerText = newLikes;
        likesElement.appendChild(likesCount);
      }
    }
    else if (json["count"] === "increase") {
      if (numLikes > 0) {
        likesCount.innerText = numLikes + 1;
      }
      else {
        likesCount.innerText = 1;
      }
      likesCountIcon.className = 'fa fa-heart-o';
      likesElement.appendChild(likesCountIcon);
      likesElement.appendChild(likesCount);
    }
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
