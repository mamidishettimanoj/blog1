// script.js

// === Utility Functions ===

// Function to retrieve all posts from localStorage
function getPosts() {
    const posts = localStorage.getItem('blogPosts');
    return posts ? JSON.parse(posts) : [];
}

// Function to save a new post to localStorage
function savePost(post) {
    const posts = getPosts();
    posts.unshift(post); // Add the new post to the beginning of the array
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Function to retrieve comments for a specific post
function getComments(postId) {
    const comments = localStorage.getItem(`comments_${postId}`);
    return comments ? JSON.parse(comments) : [];
}

// Function to save comments for a specific post
function saveComments(postId, comments) {
    localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
}

// === Display Functions ===

// Function to display all posts on the homepage
function displayPosts() {
    const postsContainer = document.getElementById('posts-container');
    const posts = getPosts();

    // Clear existing posts
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts available. <a href="create-post.html">Create the first post</a>.</p>';
        return;
    }

    // Loop through each post and create its HTML
    posts.forEach(post => {
        // Create a container for the post
        const postDiv = document.createElement('div');
        postDiv.classList.add('blog-post');

        // Post Title
        const title = document.createElement('h2');
        title.textContent = post.title;
        postDiv.appendChild(title);

        // Post Date
        const date = document.createElement('p');
        const time = document.createElement('time');
        time.textContent = new Date(post.date).toLocaleDateString();
        date.textContent = 'Published on ';
        date.appendChild(time);
        postDiv.appendChild(date);

        // Post Image (if exists)
        if (post.image) {
            const img = document.createElement('img');
            img.src = post.image;
            img.alt = post.title;
            postDiv.appendChild(img);
        }

        // Post Content Snippet
        const content = document.createElement('p');
        const snippet = post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content;
        content.textContent = snippet;
        postDiv.appendChild(content);

        // "Read More" Button
        const readMoreBtn = document.createElement('a');
        readMoreBtn.textContent = 'Read More';
        readMoreBtn.classList.add('read-more-btn');
        readMoreBtn.href = `post.html?id=${post.id}`;
        postDiv.appendChild(readMoreBtn);

        // "Delete" Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.setAttribute('data-id', post.id); // Assign the post's id to data-id
        postDiv.appendChild(deleteBtn);

        // Append the post to the container
        postsContainer.appendChild(postDiv);
    });
}

// Function to display the full post on post.html
function displayFullPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'), 10);

    if (!postId) {
        alert('Invalid post ID.');
        window.location.href = 'index.html';
        return;
    }

    const posts = getPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
        alert('Post not found.');
        window.location.href = 'index.html';
        return;
    }

    const fullPostContainer = document.getElementById('full-post-container');

    // Post Title
    const title = document.createElement('h2');
    title.textContent = post.title;
    fullPostContainer.appendChild(title);

    // Post Date
    const date = document.createElement('p');
    const time = document.createElement('time');
    time.textContent = new Date(post.date).toLocaleDateString();
    date.textContent = 'Published on ';
    date.appendChild(time);
    fullPostContainer.appendChild(date);

    // Post Image (if exists)
    if (post.image) {
        const img = document.createElement('img');
        img.src = post.image;
        img.alt = post.title;
        fullPostContainer.appendChild(img);
    }

    // Full Post Content
    const content = document.createElement('p');
    content.textContent = post.content;
    fullPostContainer.appendChild(content);
}

// Function to display comments on post.html
function displayComments() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'), 10);
    const commentsContainer = document.getElementById('comments-container');

    const comments = getComments(postId);

    // Clear existing comments
    commentsContainer.innerHTML = '';

    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }

    // Loop through each comment and create its HTML
    comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        const author = document.createElement('strong');
        author.textContent = comment.author;
        commentDiv.appendChild(author);

        const date = document.createElement('span');
        date.textContent = ` on ${new Date(comment.date).toLocaleDateString()}`;
        commentDiv.appendChild(date);

        const text = document.createElement('p');
        text.textContent = comment.text;
        commentDiv.appendChild(text);

        commentsContainer.appendChild(commentDiv);
    });
}

// === Event Handlers ===

// Handle form submission for creating a new post
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get form values
    const title = document.getElementById('title1').value.trim();
    const content = document.getElementById('content').value.trim();
    const image = document.getElementById('image').value.trim();

    // Basic validation
    if (!title || !content) {
        alert('Please enter both title and content.');
        return;
    }

    // Create a new post object
    const newPost = {
        id: Date.now(), // Unique ID based on timestamp
        title,
        content,
        image,
        date: new Date().toISOString()
    };

    // Save the post to localStorage
    savePost(newPost);

    // Redirect to homepage
    window.location.href = 'index.html';
}

// Handle form submission for adding a new comment
function handleCommentSubmit(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'), 10);

    // Get comment form values
    const author = document.getElementById('comment-author').value.trim();
    const text = document.getElementById('comment-text').value.trim();

    // Basic validation
    if (!author || !text) {
        alert('Please enter both your name and comment.');
        return;
    }

    // Create a new comment object
    const newComment = {
        author,
        text,
        date: new Date().toISOString()
    };

    // Retrieve existing comments, add the new one, and save back to localStorage
    let comments = getComments(postId);
    comments.push(newComment);
    saveComments(postId, comments);

    // Clear form fields
    document.getElementById('comment-author').value = '';
    document.getElementById('comment-text').value = '';

    // Refresh the comments display
    displayComments();
}

// Handle delete button clicks
function handleDelete(event) {
    // Check if the clicked element has the class 'delete-btn'
    if (event.target.classList.contains('delete-btn')) {
        const postId = parseInt(event.target.getAttribute('data-id'), 10);

        // Confirm deletion
        const confirmDelete = confirm('Are you sure you want to delete this post?');
        if (!confirmDelete) {
            return;
        }

        // Retrieve all posts
        let posts = getPosts();

        // Find the index of the post to delete
        const postIndex = posts.findIndex(post => post.id === postId);
        if (postIndex === -1) {
            alert('Post not found.');
            return;
        }

        // Remove the post from the array
        posts.splice(postIndex, 1);

        // Save the updated posts array back to localStorage
        localStorage.setItem('blogPosts', JSON.stringify(posts));

        // Remove the post's HTML from the DOM
        const postDiv = event.target.parentElement;
        postDiv.remove();

        // Optional: Alert the user
        alert('Post deleted successfully.');

        // Optional: If no posts remain, display a message
        if (posts.length === 0) {
            const postsContainer = document.getElementById('posts-container');
            postsContainer.innerHTML = '<p>No posts available. <a href="create-post.html">Create the first post</a>.</p>';
        }
    }
}

// === Initialization ===

// Run this function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Determine which page is loaded based on the filename
    const page = window.location.pathname.split('/').pop();

    if (page === 'index.html' || page === '') {
        // If on the homepage, display all posts and set up delete button handlers
        displayPosts();

        // Add a click event listener to the posts container for delete functionality
        const postsContainer = document.getElementById('posts-container');
        postsContainer.addEventListener('click', handleDelete);
    }
    else if (page === 'create-post.html') {
        // If on the create post page, handle form submission
        const postForm = document.getElementById('post-form');
        postForm.addEventListener('submit', handleFormSubmit);
    }
    else if (page === 'post.html') {
        // If on the full post page, display the post and comments, and handle comment submissions
        displayFullPost();
        displayComments();

        const commentForm = document.getElementById('comment-form');
        commentForm.addEventListener('submit', handleCommentSubmit);
    }
});
