import appConstants from '../common/constants'
import { goTo, render, routes } from '../router'
import {dialogTypes} from './modal-dialog'

const EVENTS = {
    ok: 'ok-dialog-event',
    cancel: 'cancel-dialog-event'
}

class NavComponent extends HTMLElement {
    constructor() {
        super()
        const shadow = this.attachShadow({ mode: 'open' })
        const wrapper = document.createElement('div')
        this.searchType = appConstants.search.types.post

        wrapper.setAttribute('class', 'main-menu')
        this.links = [
            { href: appConstants.routes.index, name: 'Home', class: 'home-link' },
            { href: appConstants.routes.posts, name: 'Posts', class: 'posts-link' },
            { href: appConstants.routes.users, name: 'Users', class: 'users-link' },
        ]

        const style = document.createElement('style')

        style.textContent = `
           .main-menu {
               display: flex;
               align-items: center;
               padding: 5px;
           }

           .global-search {
               font-size: 16px;
               border: 1px solid #ccc;
               border-radius: 8px;
               padding: 4px 20px;
               width: 100%;
               margin: 0 50px;
           }

           .global-search:placeholder{
               color: #aaa;
           }
           
        `

        shadow.appendChild(style)
        shadow.appendChild(wrapper)

        this.links.forEach(link => {
            const l = document.createElement('nav-link')
            l.setAttribute('class', `main-link ${link.class}`)
            l.setAttribute('href', link.href)
            l.setAttribute('text', link.name)
            wrapper.appendChild(l)
        })

        const search = document.createElement('input')
        search.setAttribute('class', 'global-search')
        search.addEventListener('keyup', (e) => {
            e.stopPropagation()
            if (e.key === 'Enter') {
                e.preventDefault()
                const text = e.target.value
                if (text) {
                    if(text.trim().length < 2){
                        //alert('Search string must contain at least 2 chars')
                        const md = shadow.querySelector('modal-dialog')

                        md.setAttribute('is-opened', 'true')
                        md.setAttribute('dialog-type', dialogTypes.error)
                        md.setAttribute('one-button', 'true')
                        return 
                    }

                    if (this.searchType === appConstants.search.types.post) {
                        //we have deal with search for posts
                        const url = routes.PostsSearch.reverse({ query: text })
                        goTo(url)
                    }
                    if (this.searchType === appConstants.search.types.user) {
                        //we have deal with search for users
                        const url = routes.UsersSearch.reverse({ query: text })
                        goTo(url)
                    }
                }
            }
        })

        wrapper.appendChild(search)

        //adding modal dialog
        const modalDialog = document.createElement('modal-dialog')
        modalDialog.innerHTML = `
        <div slot="title">Error</div>
        <div slot="message">Search string must contain at least 2 chars</div>
        `
        modalDialog.setAttribute('ok-event', EVENTS.ok)
        modalDialog.setAttribute('cancel-event', EVENTS.cancel)
        modalDialog.addEventListener(EVENTS.ok, (event)=> {
            event.stopPropagation()
            modalDialog.setAttribute('is-opened', 'false')
        })
        modalDialog.addEventListener(EVENTS.cancel, (event)=> {
            event.stopPropagation()
            modalDialog.setAttribute('is-opened', 'false')
        })
        wrapper.appendChild(modalDialog)
    }

    updateSearch() {
        const shadow = this.shadowRoot
        const input = shadow.querySelector('input')
        const search = this.getAttribute('search')
        input.value = search
        if (this.searchType === appConstants.search.types.post) {
            input.setAttribute('placeholder', 'Search post...')
        } else if (this.searchType === appConstants.search.types.user) {
            input.setAttribute('placeholder', 'Search user...')
        }

    }

    connectedCallback() {
        const shadow = this.shadowRoot;
        const searchText = this.getAttribute('search')
        this.searchType = this.getAttribute('type') ? this.getAttribute('type') : appConstants.search.types.post

        if (searchText) {
            const input = shadow.querySelector('input')
            input.value = searchText
        }

        const { pathname: path } = new URL(window.location.href)
        const link = this.links.find((l) => l.href === path)

        if (link) {
            const linkElement = shadow.querySelector(`.${link.class}`)
            linkElement.setAttribute('selected', 'true')
        }
    }


    static get observedAttributes() {
        return ['search', 'type']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'search') {
            this.updateSearch()
        }
        if (name === 'type') {
            this.searchType = newValue
            this.updateSearch()
        }
    }
}

customElements.define('main-nav', NavComponent)