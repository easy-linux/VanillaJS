import appConstants from '../common/constants'
import { goTo } from '../router'
import { randomColor, invertColor, getUserInitials, colorForString } from '../common/utils'

class UserAvatar extends HTMLElement {
    constructor() {
        super()
        const shadow = this.attachShadow({ mode: 'open' })
        const wrapper = document.createElement('div')
        wrapper.setAttribute('class', 'user-avatar')

        const text = document.createElement('div')
        text.setAttribute('class', 'avatar-text')
        wrapper.appendChild(text)

        const style = document.createElement('style')
        this.selected = false;

        shadow.appendChild(style)
        shadow.appendChild(wrapper)

    }

    connectedCallback() {
        this.updateElement()
    }

    onClick = (e) => {
        e.preventDefault()
        if (!this.selected) {
            const { pathname: path } = new URL(e.target.href)
            goTo(path)
        }
    }

    static get observedAttributes() {
        return ['user-name', 'small']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.updateElement()
    }

    updateElement() {
        const shadow = this.shadowRoot

        const userName = this.getAttribute('user-name')
        const small = this.getAttribute('small')

        const style = shadow.querySelector('style')
        const avatar = shadow.querySelector('.user-avatar')
        const text = shadow.querySelector('.avatar-text')


        if (small) {
            avatar.setAttribute('class', 'user-avatar small')
        } else {
            avatar.setAttribute('class', 'user-avatar')
        }

        if (userName) {
            text.textContent = getUserInitials(userName)
        }

        if(userName){
            const bgColor = colorForString(userName)
            const textColor = invertColor(bgColor)
            
            style.textContent = `
               
               .user-avatar{
                   display: flex;
                   justify-content: center;
                   align-items: center;
                   font-size: 20px;
                   width: 40px;
                   height: 40px;
                   text-transform: uppercase;
                   font-family: fixed;
                   border-radius: 50%;
                   padding: 16px;
                   background-color: ${bgColor};
                   color: ${textColor};
                   margin-right: 5px;
               }
    
               .user-avatar.small{
                   font-family: arial;
                   font-size: 16px;
                   width: 10px;
                   height: 10px;
               }
    
            `
        }
    }
}

customElements.define('user-avatar', UserAvatar)