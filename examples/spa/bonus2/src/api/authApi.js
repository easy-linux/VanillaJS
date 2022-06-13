import baseApi from './baseApi'

export const login = (user, password) => {
    return baseApi.post(`/login`, {login: user, password})
}


export default {
    login,
}