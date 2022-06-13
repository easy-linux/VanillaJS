import baseApi from './baseApi'

export const getPosts = (page) => {
    return baseApi.get(`/posts?_page=${page}&limit=10`)
}

export const getPostsByUser = (userId, page) => {
    return baseApi.get(`/posts?userId=${userId}&_page=${page}&limit=10`)
}

export const getPostById = (postId) => {
    return baseApi.get(`/post/${postId}`)
}

export const getPostsSearch = (search, page) => {
    return baseApi.get(`/posts?search=${search}&_page=${page}&limit=10`)
}

export default {
    getPosts,
    getPostsByUser,
    getPostById,
    getPostsSearch,
}