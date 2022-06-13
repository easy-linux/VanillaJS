import baseApi from './baseApi'

export const getCommentsByPost = (postId, page) => {
    return baseApi.get(`/post/${postId}/comments?_page=${page}&limit=10`)
}

export const getCommentsByUser = (userId, page) => {
    return baseApi.get(`/comments?userId=${userId}&_page=${page}&limit=10`)
}

export const getCommentsSearch = (search, page) => {
    return baseApi.get(`/comments?q=${search}&_page=${page}&limit=10`)
}

export default {
    getCommentsByPost,
    getCommentsByUser,
}