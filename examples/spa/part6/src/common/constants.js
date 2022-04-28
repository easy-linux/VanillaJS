const appConstants = {
    routes: {
        index: '/',
        posts: '/posts',
        postsSearch: '/posts/query/:query',
        usersSearch: '/users/query/:query',
        users: '/users',
    },
    search: {
        types: {
            post: 'post',
            user: 'user',
        }
    },
    lists: {
        types: {
            post: 'post',
            user: 'user',
        }
    }
}

export default appConstants