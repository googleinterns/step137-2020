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

function getPosts() {
  postDivElement = document.getElementById("posts");
  fetch('/post')
    .then(response => response.json())
    .then(posts => {
      for (let i = 0; i < posts.length; i ++) {
        postDivElement.appendChild(createPost(posts[i]));
      }
    });
}

function createPost(post) {
  const caption = document.createElement('p');
  caption.id = "caption";
  caption.innerText = post.caption;

  const imageElement = document.createElement('img');
  imageElement.id = "image";

  const params = new URLSearchParams();
  blobKey = post.blobKey;
  params.append('blobKey', Object.values(blobKey));
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
