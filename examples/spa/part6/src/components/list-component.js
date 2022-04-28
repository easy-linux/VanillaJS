import appConstants from '../common/constants'
import { goTo } from '../router'
import { randomColor, invertColor, getUserInitials, highlightText } from '../common/utils'
import { getPost, setPost } from '../service/posts'
import { getUser, setUser } from '../service/users'
import { getPosts, getPostsByUser, getPostsSearch } from '../api/postsApi'
import { getUsers, getUsersSearch } from '../api/usersApi'

class ListComponent extends HTMLElement {
    constructor() {
        super()
        this.search = '';
        this.page = 1;
        this.lastPage = false;
        this.typeList = appConstants.lists.types.post;

        const shadow = this.attachShadow({ mode: 'open' })
        const wrapper = document.createElement('div')
        wrapper.setAttribute('class', 'list-block')

        const title = document.createElement('h2')
        title.setAttribute('class', 'list-title')
        shadow.appendChild(title)

        //pagination
        const pagination = document.createElement('pagination-component')
        pagination.setAttribute('class', 'list-pagination')
        pagination.setAttribute('page', this.page)
        pagination.setAttribute('last', this.lastPage)

        pagination.addEventListener('paginate-back', (e) => {
            e.stopPropagation()
            if (this.page > 1) {
                this.page = this.page - 1
                if(this.typeList === appConstants.lists.types.post){
                    this.getPostsPage()
                }
                if(this.typeList === appConstants.lists.types.user){
                    this.getUsersPage()
                }
            }
        })

        pagination.addEventListener('paginate-next', (e) => {
            e.stopPropagation()
            if (!this.lastPage) {
                this.page = this.page + 1
                if(this.typeList === appConstants.lists.types.post){
                    this.getPostsPage()
                }
                if(this.typeList === appConstants.lists.types.user){
                    this.getUsersPage()
                }
                
            }
        })
        shadow.appendChild(pagination)

        const style = document.createElement('style')

        style.textContent = `
           
           .list-block{
               display: flex;
               align-items: flex-start;
               justify-content: center;
               flex-wrap: wrap;
               padding: 5px;
           }

           .list-title{
               text-align: center;
           }

           .list-pagination{
            display: flex;
            justify-content: center;
           }

        `

        shadow.appendChild(style)
        shadow.appendChild(wrapper)
    }

    connectedCallback() {
        this.updateComponent()
    }

    static get observedAttributes() {
        return ['search', 'list-type']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'search') {
            this.search = newValue
            this.updateComponent()
        }
        if (name === 'sealist-typerch') {
            this.typeList = newValue
            this.updateComponent()
        }
    }

    updateComponent() {
        const shadow = this.shadowRoot
        const userId = this.getAttribute('user')
        const search = this.getAttribute('search')
        const typeList = this.getAttribute('list-type')

        if (search) {
            this.search = search
        }

        if (typeList) {
            this.typeList = typeList
        }

        const title = shadow.querySelector('.list-title')

        if (this.typeList === appConstants.lists.types.post) {
            title.textContent = 'All posts'

            if (userId) {
                title.textContent = "Users' posts"
            }

            this.getPostsPage()
        }
        if (this.typeList === appConstants.lists.types.user) {
            title.textContent = 'All users'
            this.getUsersPage()
        }
        
    }

    getPostsPage() {
        const shadow = this.shadowRoot
        const userId = this.getAttribute('user')
        const wrapper = shadow.querySelector('.list-block')
        const pagination = shadow.querySelector('pagination-component')
        pagination.setAttribute('page', this.page)
        pagination.setAttribute('last', this.lastPage)

        wrapper.innerHTML = ''

        const apiCall = this.search ? getPostsSearch(this.search, this.page) :
            userId ? getPostsByUser(userId, this.page) : getPosts(this.page)

        apiCall.then(posts => {
            this.lastPage = posts.length < 10
            posts.forEach(post => {
                setPost(post)
                const postElement = document.createElement('post-component')
                postElement.setAttribute('id', post.id)
                if (this.search) {
                    postElement.setAttribute('search', this.search)
                }
                wrapper.appendChild(postElement)
            });
        })
            .catch(error => console.log(error))

    }

    getUsersPage() {
        const shadow = this.shadowRoot
        const userId = this.getAttribute('user')
        const wrapper = shadow.querySelector('.list-block')
        const pagination = shadow.querySelector('pagination-component')
        pagination.setAttribute('page', this.page)
        pagination.setAttribute('last', this.lastPage)

        wrapper.innerHTML = ''

        const apiCall = this.search ? getUsersSearch(this.search, this.page)
             : getUsers(this.page)

        apiCall.then(users => {
            this.lastPage = users.length < 10
            users.forEach(user => {
                setUser(user)
                const userElement = document.createElement('user-component')
                userElement.setAttribute('id', user.id)
                if (this.search) {
                    userElement.setAttribute('search', this.search)
                }
                wrapper.appendChild(userElement)
            });
        })
            .catch(error => console.log(error))

    }

}

customElements.define('list-component', ListComponent)