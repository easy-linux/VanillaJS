const appConstants = {
    routes: {
        index: '/',
        posts: '/posts',
        postsSearch: '/posts/query/:query',
        usersSearch: '/users/query/:query',
        users: '/users',
        post: '/post/:post',
        user: '/user/:user',
        userPosts: '/user/:user/posts',
        userComments: '/user/:user/comments',
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
            comment: 'comment',
        }
    }
}

export default appConstants