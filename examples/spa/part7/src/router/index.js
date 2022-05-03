import appConstants from "../common/constants";
import Route from 'route-parser'

import MainPage from '../pages/main.template'
import PostsPage from '../pages/posts.template'
import UsersPage from '../pages/users.template'
import PostPage from '../pages/post.template'
import UserPage from '../pages/user.template'
import UserPostsPage from '../pages/userPosts.template'
import UserCommentsPage from '../pages/userComments.template'


export const routes = {
    Main: new Route(appConstants.routes.index),
    Posts: new Route(appConstants.routes.posts),
    PostsSearch: new Route(appConstants.routes.postsSearch),
    Users: new Route(appConstants.routes.users),
    UsersSearch: new Route(appConstants.routes.usersSearch),
    Post: new Route(appConstants.routes.post),
    User: new Route(appConstants.routes.user),
    UserPosts: new Route(appConstants.routes.userPosts),
    UserComments: new Route(appConstants.routes.userComments),
}

const routesWithPages = [
    { route: routes.Main, page: MainPage },
    { route: routes.Posts, page: PostsPage },
    { route: routes.PostsSearch, page: PostsPage },
    { route: routes.Users, page: UsersPage },
    { route: routes.UsersSearch, page: UsersPage },
    { route: routes.Post, page: PostPage },
    { route: routes.User, page: UserPage },
    { route: routes.UserPosts, page: UserPostsPage },
    { route: routes.UserComments, page: UserCommentsPage },
]

export const getPathRoute = (path) => {
    const target = routesWithPages.find(r => r.route.match(path))
    if (target) {
        const params = target.route.match(path)
        return {
            page: target.page,
            route: target.route,
            params
        }
    }
    return null
}

export const render = (path) => {
    let result = '<h1>404</h1>'

    const pathRoute = getPathRoute(path)

    if (pathRoute) {
        result = pathRoute.page(pathRoute.params)
    }

    document.querySelector('#app').innerHTML = result
}

export const goTo = (path) => {
    window.history.pushState({ path }, path, path)
    render(path)
}

export const getRouterParams = () => {
    const url = new URL(window.location.href).pathname
    return getPathRoute(url)
}

const initRouter = () => {
    window.addEventListener('popstate', e => {
        render(new URL(window.location.href).pathname)
    })
    document.querySelectorAll('[href^="/"]').forEach(el => {
        el.addEventListener('click', (env) => {
            env.preventDefault()
            const { pathname: path } = new URL(env.target.href)
            goTo(path)
        })
    })
    render(new URL(window.location.href).pathname)
}

export default initRouter