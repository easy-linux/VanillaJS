import baseApi from './baseApi'

export const getUsers = (page) => {
    return baseApi.get(`/users?_page=${page}&limit=10`)
}

export const getUserById = (userId) => {
    return baseApi.get(`/user/${userId}`)
}

export const getUsersSearch = (search, page) => {
    return baseApi.get(`/users?search=${search}&_page=${page}&limit=10`)
}

export default {
    getUsers,
    getUserById,
    getUsersSearch,
}