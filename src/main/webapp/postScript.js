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

function getPosts(userId) {
  locationName = sessionStorage.getItem(SESSION_STORE_LOCATION);
  postDivElement = document.createElement('div');
  fetch('/post')
    .then(response => response.json())
    .then(posts => {
      if (posts.length === 0) {
        noPostElement = document.createElement('p');
        noPostElement.innerText = "No posts to show.";
        postDivElement.appendChild(noPostElement);
      }
      else {
        for (let i = 0; i < posts.length; i ++) {
          if (locationName === posts[i].location) {
            postDivElement.appendChild(createPost(posts[i], userId));
          }
        }
      }
    });
  return postDivElement;
}

function createPost(post, userId) {
  const caption = document.createElement('p');
  caption.id = "caption";
  caption.innerText = post.caption;

  const imageElement = document.createElement('img');
  imageElement.id = "image";
  imageElement.height = "200";
  imageElement.width = "200";
  
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
  
  const postElement = document.createElement('div');
  postElement.className = "card";
  postElement.append(imageElement);
  postElement.append(caption);
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
