function onload() {
  fetchBlobstoreUrlAndShowForm();
  getLocationInfo();
}

function fetchBlobstoreUrlAndShowForm() {
  fetch('/blobstore-upload-url')
      .then((response) => {
        return response.text();
      })
      .then((imageUploadUrl) => {
        const messageForm = document.getElementById('post');
        messageForm.action = imageUploadUrl;
        messageForm.classList.remove('hidden');
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
  postElement.append(imageElement);
  postElement.append(caption);

  return postElement;
}

function createPostWithResponse(post, userId) {
  const postElement = createPostNoResponse(post);
  const bottomCard = document.createElement('div');

  if (userId === post.creator) {
    const deleteButton = document.createElement('button');
    deleteButton.className = "icon-button";
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa fa-trash-o';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', () => {
      deleteSinglePost(post, postElement);
    });
    bottomCard.append(deleteButton);
  }
  
  postElement.className = "card";
  postElement.append(bottomCard);

  return postElement;
}

function deleteSinglePost(post, postElement) {
  blobKey = post.blobKey;
  deleteBlob(blobKey);
  const params = new URLSearchParams();
  params.append('id', post.id);
  fetch('/delete-single-post', {
    method: 'POST', body: params
  }).then(postElement.style.display = "none")
    .then(getPosts());
}

function deleteBlob(blobkey) {
  const params = new URLSearchParams();
  params.append("blobkey", blobkey);
  fetch('/delete-blob', {
    method:'POST', body: params
  })
}
