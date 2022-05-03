const apiServer = import.meta.env.DEV ? 'http://localhost:1111' : 'http://localhost:1111'

const baseFetch = (url, config = {}, params) => {
    return new Promise((resolve, reject) => {
        try{
            const _config = {
                ...config
            }
            if(params){
                _config['body'] = JSON.stringify(params)
            }
            window.fetch(`${apiServer}${url}`, {
                ..._config
            }).then(response=>response.json())
            .then(resolve, reject)
        } catch(e){
            reject(e)
        }
    })
}

const fetchGet = (url, config) => {
    return baseFetch(url, config)
}

const fetchPost = (url, params ={}, config = {}) => {
    return baseFetch(url, {
        ...config,
        method: 'POST'
    }, params)
}

const fetchPut = (url, params ={}, config = {}) => {
    return baseFetch(url, {
        ...config,
        method: 'PUT'
    }, params)
}
const fetchPatch = (url, params ={}, config = {}) => {
    return baseFetch(url, {
        ...config,
        method: 'PATCH'
    }, params)
}

const fetchDelete = (url, params ={}, config = {}) => {
    return baseFetch(url, {
        ...config,
        method: 'DELETE'
    }, params)
}

export default {
    get: fetchGet,
    post: fetchPost,
    put: fetchPut,
    patch: fetchPatch,
    delete: fetchDelete,
}