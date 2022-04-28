import appConstants from '../common/constants'
import { goTo } from '../router'
import { highlightText } from '../common/utils'
import { getUser, setUser } from '../service/users'
import { getUsersById } from '../api/usersApi'

class UserComponent extends HTMLElement {
    constructor(){
        super()
        const shadow = this.attachShadow({mode: 'open'})
        const wrapper = document.createElement('div')
        wrapper.setAttribute('class', 'user-holder')
        const block = document.createElement('div')
        block.setAttribute('class', 'user-block')
        wrapper.appendChild(block)

        const title = document.createElement('h2')
        title.setAttribute('class', 'user-title-main')
        
        shadow.appendChild(title)

        block.innerHTML = `
            <div class="avatar-holder">
                <user-avatar></user-avatar>
                <div class="user-title"></div>
            </div>
            <div class="user-text"></div>
            <div class="user-buttons">
                <div class="user-btn user-btn-posts">Posts</div>
                <div class="user-btn user-btn-comments">Comments</div>
            </div>
        `

        const style = document.createElement('style')

        shadow.appendChild(style)
        shadow.appendChild(wrapper)
    }

    connectedCallback(){
        const shadow = this.shadowRoot
        const id = this.getAttribute('id')
        const single = this.getAttribute('single')
        const user = getUser(id)

        if(single){
            const title = shadow.querySelector('user-title-main')
            title.textContent = 'User info'
        }
        this.updateStyle()
        
        if(user){
            this.updateUser()
        } else {
            getUsersById(id).then((user)=> {
                setUser(user)
                this.updateUser()
            })
            .catch(e => console.log(e))
        }


        const btnPosts = shadow.querySelector('.user-btn-posts')
        btnPosts.addEventListener('click', (e) => {
            e.stopPropagation()
            //goto user's posts 
            //const url = 
            //goTo(url)
        })

        const btnComments = shadow.querySelector('.user-btn-comments')
        btnComments.addEventListener('click', (e) => {
            e.stopPropagation()
            //goto user's comments 
            //const url = 
            //goTo(url)
        })
    }

    updateUser() {
        const shadow = this.shadowRoot
        const id = this.getAttribute('id')
        const search = this.getAttribute('search')
        const title = shadow.querySelector('.user-title')
        const text = shadow.querySelector('.user-text')

        const user = getUser(id)

        if(search){
            title.innerHTML = highlightText(user.user_fullname, search)
            text.innerHTML = highlightText(user.user_name, search)
        } else {
            title.textContent = user.user_fullname
            text.textContent = user.user_name
        }
        
        const userAvatar = shadow.querySelector('user-avatar')
        userAvatar.setAttribute('user-name', user.user_name)
    }

    updateStyle(){
        const shadow = this.shadowRoot
        const single = this.getAttribute('single')
        const style = shadow.querySelector('style')

        const customStyle = single ? `
           background-color: #fff;
           border: 1px solid #ccc;
        ` : `
           background-color: #ccc;
        `

        const customButtonStyle = single ? `
           background-color: #fff;
           border: 1px solid #ccc;
        ` : `
           background-color: #ccc;
        `

        style.textContent = `
           .user-holder{
               display: flex;
               justify-content: center;
           }

           .avatar-holder{
               display: flex;
           }
           
           .user-title-main{
               text-align: center;
           }
           
           
           .user-block{
            max-width: 200px;
            border-radius: 10px;
            ${customStyle}
            margin: 10px;
            padding: 10px;
        }

        .user-block .user-title{
            padding: 10px;
            font-weight: bold; 
        }

        .user-block .user-text{
            padding: 10px;
            font-family: fantasy;
            max-height: 200px;
            overflow: hidden;
            cursor: pointer;
        }
        
        .user-block .user-buttons{
            padding: 10px;
            font-family: arial;
            display: flex;
            justify-content: space-around;
            min-width: 200px;
        } 
       
        .user-block .user-buttons .user-btn{
            padding: 10px;
            ${customButtonStyle}
            color: #666;
            border-radius: 8px;
            cursor: pointer;
        }

        .user-block .user-buttons .user-btn:hover{
            color: #333;
            background-color: #eee;
        }

        .highlight{
            background-color: yellow;
        }
        `
    }
    
}

customElements.define('user-component', UserComponent)