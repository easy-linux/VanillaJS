import baseApi from './baseApi'

export const getUsers = (page) => {
    return baseApi.get(`/users?_page=${page}&limit=10`)
}

export const getUserById = (userId) => {
    return baseApi.get(`/users/${userId}`)
}

export const getUsersSearch = (search, page) => {
    return baseApi.get(`/users?q=${search}&_page=${page}&limit=10`)
}

export default {
    getUsers,
    getUserById,
    getUsersSearch,
}