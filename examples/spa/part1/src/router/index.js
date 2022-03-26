import appConstants from "../common/constants";
import Route from 'route-parser'

import MainPage from '../pages/main.template'
import PostsPage from '../pages/posts.template'
import UsersPage from '../pages/users.template'


export const routes = {
    Main: new Route(appConstants.routes.index),
    Posts: new Route(appConstants.routes.posts),
    Users: new Route(appConstants.routes.users),
}

export const render = (path) => {
    let result = '<h1>404</h1>'

    if(routes.Main.match(path)){
        result = MainPage()
    } else if(routes.Posts.match(path)){
        result = PostsPage()
    } else if(routes.Users.match(path)){
        result = UsersPage()
    }

    document.querySelector('#app').innerHTML = result
}

export const goTo = (path) => {
    window.history.pushState({path}, path, path)
    render(path)
}

const initRouter = () => {
    window.addEventListener('popstate', e => {
        render( new URL(window.location.href).pathname)
    })
    document.querySelectorAll('[href^="/"]').forEach(el => {
        el.addEventListener('click', (env) => {
            env.preventDefault()
            const {pathname: path} = new URL(env.target.href)
            goTo(path)
        })
    })
    render(new URL(window.location.href).pathname)
}

export default initRouter