import { authApi } from '../api'
import { defaultEvents, dialogTypes } from './modal-dialog'
import appConstants from '../common/constants';

class AppComponent extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div')
    wrapper.setAttribute('class', 'app-block');

    wrapper.innerHTML = `
    <div class="app">
      <h2> Main Page </h2>
      <form class="login-form">
          <input placeholder="user" name="user" class="input-user" />
          <input placeholder="password" name="password" type="password" class="input-password" />
          <button type="submit">Login</button>
        </form>
      <div class="wrapper">
        
        <div>
          <slot name="block-top"></slot>

          <div class="center-block">
              <slot name="block-left"></slot>
              <slot name="block-right"></slot>
          </div>

          <slot name="block-bottom"></slot>
        </div>
      </div>
      <modal-dialog></modal-dialog>
    </div>
    `


    const style = document.createElement('style');
    style.textContent = `
    .wrapper{
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      text-align: center;
    }
    div[slot]{
      padding: 20px;
    }

    h2{
      text-align: center;
    }
    .center-block {
        display: flex;
    }
    .block-left,
    .block-right{
      width: 50px;
    }
    `

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

  }

  connectedCallback() {
    const shadow = this.shadowRoot;
    const form = shadow.querySelector('form.login-form')
    const md = shadow.querySelector('modal-dialog')
    md.setAttribute('dialog-type', dialogTypes.error)
    md.setAttribute('one-button', 'true')
    

    md.addEventListener(defaultEvents.okEvent, (event) => {
      event.stopPropagation()
      md.setAttribute('is-opened', 'false')
    })

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const user = shadow.querySelector('.input-user')
      const password = shadow.querySelector('.input-password')
      if (user.value && password.value) {
        authApi.login(user.value, password.value).then(
          data => {
            if(data?.token){
              window.sessionStorage.setItem(appConstants.storage.keys.token, data?.token)
            }
          }
        ).catch(e => console.log(e))
      } else {
        
        md.innerHTML = `
          <div slot="title">Error</div>
          <div slot="message">
              <div>User and Password are required!</div>  
          </div>
        `
        md.setAttribute('is-opened', 'true')
        
      }
    })

  }

}

customElements.define('app-component', AppComponent)

