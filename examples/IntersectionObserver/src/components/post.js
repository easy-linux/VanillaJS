export const createPost = (postData) => {
    
    const post = document.createElement('div')
    post.dataset.postId = postData.id;
    post.dataset.userId = postData.userId;
    post.className = 'post'
    post.innerHTML = `
    <h2>${postData.title}</h2>
    <div class="text">${postData.body}</div>
    `
    return post
}