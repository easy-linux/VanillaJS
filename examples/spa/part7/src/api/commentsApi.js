import baseApi from './baseApi'

export const getCommentsByPost = (postId, page) => {
    return baseApi.get(`/posts/${postId}/comments?_page=${page}&limit=10&_expand=user&_sort=createAt`)
}

export const getCommentsByUser = (userId, page) => {
    return baseApi.get(`/comments?userId=${userId}&_page=${page}&limit=10&_expand=user&_expand=post`)
}

export const getCommentsSearch = (search, page) => {
    return baseApi.get(`/comments?q=${search}&_page=${page}&limit=10&_expand=user&_expand=post`)
}

export default {
    getCommentsByPost,
    getCommentsByUser,
}