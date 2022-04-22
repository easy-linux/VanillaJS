const posts = new Map()

export const getPost = (postId) => {
    return posts.get(postId)
}

export const setPost = (post) => {
    posts.set(post.id, post)
}

export default {
    getPost,
    setPost
}