import { defaultEvents, dialogTypes } from './modal-dialog'

class FakeForm extends HTMLElement {
  constructor() {

    super();
    this.block = ''
    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div')
    wrapper.setAttribute('class', 'form-block');
    wrapper.innerHTML = `
    <div class="form">
      <h4 class="title"></h4>
      <input placeholder="User name" class="input-text">
      <input type="password" placeholder="password" class="input-password">
      <div class="buttons">
          <button class='ok-button'>Ok</button>
          <button class='cancel-button'>Cancel</button>
      </div>
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
    .form{
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      padding: 10px;
      border: 1px solid #ccc;
      
      border-radius: 8px;
      margin: 10px;
      font-size: 10px;
      font-family: arial;
    }

    h4{
        text-align: center;
    }
    input{
      margin-bottom: 5px;
    }
    `

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

  }

  connectedCallback() {

    const shadow = this.shadowRoot;
    this.block = this.getAttribute('block')

    const wrapper = shadow.querySelector('.form-block')
    const title = shadow.querySelector('.title')
    title.textContent = `Form ${this.block}`
    const okButton = shadow.querySelector('.ok-button')
    const cancelButton = shadow.querySelector('.cancel-button')

    const inputText = shadow.querySelector('.input-text')
    const inputPassword = shadow.querySelector('.input-password')

    okButton.addEventListener('click', (e) => {
      const md = shadow.querySelector('modal-dialog')
      md.innerHTML = `
      <div slot="title">Information</div>
      <div slot="message">
        <div>ok</div>
        <div>Form ${this.block}</div>
        <div>Intut text: ${inputText.value}</div>
        <div>Input password: ${inputPassword.value}</div>
      </div>
      `

      md.setAttribute('is-opened', 'true')
      md.setAttribute('dialog-type', dialogTypes.info)
    })

    cancelButton.addEventListener('click', (e) => {
      const md = shadow.querySelector('modal-dialog')
      md.innerHTML = `
      <div slot="title">Warning</div>
      <div slot="message">
      <div>Cancel</div>
        <div>Form ${this.block}</div>
        <div>Intut text: ${inputText.value}</div>
        <div>Input password: ${inputPassword.value}</div>
      </div>
      `
      md.setAttribute('is-opened', 'true')
      md.setAttribute('dialog-type', dialogTypes.warning)
    })

    //adding modal dialog
    const modalDialog = document.createElement('modal-dialog')
    modalDialog.innerHTML = ``

    modalDialog.addEventListener(defaultEvents.okEvent, (event) => {
      event.stopPropagation()
      alert('It was "Ok" button')
      modalDialog.setAttribute('is-opened', 'false')
    })
    modalDialog.addEventListener(defaultEvents.cancelEvent, (event) => {
      event.stopPropagation()
      alert('It was "Cancel" button')
      modalDialog.setAttribute('is-opened', 'false')
    })

    wrapper.appendChild(modalDialog)

  }

}

customElements.define('fake-form', FakeForm)

