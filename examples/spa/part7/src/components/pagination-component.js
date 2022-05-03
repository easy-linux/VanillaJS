import appConstants from '../common/constants'
import { render } from '../router'

class Pagination extends HTMLElement {
    constructor(){
        super()
        this.page = 1;
        this.lastPage = false;
        const shadow = this.attachShadow({mode: 'open'})

        const pagination = document.createElement('div')
        pagination.setAttribute('class', 'posts-pagination')

        const btnPrev = document.createElement('button')
        btnPrev.setAttribute('class', 'prev-button')
        btnPrev.textContent = '< Prev'
        btnPrev.addEventListener('click', (e) => {
            e.stopPropagation()
            if(this.page > 1){
                const event = new CustomEvent('paginate-back')
                this.dispatchEvent(event)
            }
        })

        const btnNext = document.createElement('button')
        btnNext.setAttribute('class', 'next-button')
        btnNext.textContent = 'Next >'
        btnNext.addEventListener('click', (e) => {
            e.stopPropagation()
            if(!this.lastPage){
                const event = new CustomEvent('paginate-next')
                this.dispatchEvent(event)
            }
        })

        const pageLabel = document.createElement('div')
        pageLabel.setAttribute('class', 'page-label')
        pageLabel.textContent = `Page ${this.page}`

        pagination.appendChild(btnPrev)
        pagination.appendChild(pageLabel)
        pagination.appendChild(btnNext)
        shadow.appendChild(pagination)

        const style = document.createElement('style')

        style.textContent = `
           
           .posts-pagination{
               display: flex;
               justify-content: center;

           }
           .page-label{
               margin: 0 10px;
               font-weight: bold;
               font-family: system-ui;
           }
        `

        shadow.appendChild(style)

    }

    updateComponent(){
        const shadow = this.shadowRoot
        const nextBtn = shadow.querySelector('.next-button')
        const prevBtn = shadow.querySelector('.prev-button')
        const pageLabel = shadow.querySelector('.page-label')
        if(this.page === 1){
            prevBtn.setAttribute('disabled', true)
        } else {
            prevBtn.removeAttribute('disabled')
        }
        if(this.lastPage){
            nextBtn.setAttribute('disabled', true)
        } else {
            nextBtn.removeAttribute('disabled')
        }
        pageLabel.textContent = `Page ${this.page}`
    }

    connectedCallback(){
        this.updateComponent()
    }

    static get observedAttributes(){
        return ['page', 'last']
    }

    attributeChangedCallback(name, oldValue, newValue){
        if(name === 'page'){
            this.page = JSON.parse(newValue)
        }
        if(name === 'last'){
            this.lastPage = JSON.parse(newValue)
        }
        this.updateComponent()
    }
}

customElements.define('pagination-component', Pagination)