export const defaultEvents = {
  okEvent: 'ok-click',
  cancelEvent: 'cancel-click'
}

export const dialogTypes = {
  error: 'error',
  info: 'info',
  warning: 'warning',
}

class ModalDialog extends HTMLElement {
  constructor() {

    super();
    this.okEvent = defaultEvents.okEvent
    this.cancelEvent = defaultEvents.cancelEvent
    const shadow = this.attachShadow({ mode: 'open' });
    
    const template = document.querySelector('#modal-dialog-template')
    const wrapper = template.content.cloneNode(true);

    const style = document.createElement('style');
    style.textContent = `

    .modal-dialog {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 999;
      display: none;
    }

    .modal-dialog.opened {
        display: flex;
    }

    .modal-dialog-backdrop {
        width: 100vw;
        height: 100vh;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: rgba(33, 33, 33, 0.5)
    }

    .modal-dialog-wrapper {
        border: 1px solid #ccc;
        background-color: #fff;
        overflow: hidden;
        border-radius: 8px;
        font-size: 14px;
        font-family: arial;
        z-index: 1;
    }

    .modal-dialog-title,
    .modal-dialog-message,
    .buttons {
        text-align: center;
        padding: 10px;
    }

    .buttons {
        border-top: 1px solid #ccc;
    }

    .cancel-button.hide {
        display: none;
    }

    .modal-dialog-wrapper .modal-dialog-title {
        background-color: #ccc;
        color: #fff;
    }

    .modal-dialog-wrapper.${dialogTypes.error} .modal-dialog-title{
      background-color: #f00;
      color: #fff;
    }

    .modal-dialog-wrapper.${dialogTypes.info} .modal-dialog-title{
      background-color: #00f;
      color: #fff;
    }

    .modal-dialog-wrapper.${dialogTypes.warning} .modal-dialog-title{
      background-color: #e0cf34;
      color: #333;
    }
    
    `

    shadow.appendChild(wrapper);
    shadow.appendChild(style);

  }

  connectedCallback() {

    const shadow = this.shadowRoot;

    this.okEvent = this.getAttribute('ok-event') || defaultEvents.okEvent
    this.cancelEvent = this.getAttribute('cancel-event') || defaultEvents.cancelEvent

    const backdrop = shadow.querySelector('.modal-dialog-backdrop')
    backdrop.addEventListener('click', this.cancelClick)

    const dialog = shadow.querySelector('.modal-dialog-wrapper')

    dialog.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    const okButton = shadow.querySelector('.ok-button')
    const cancelButton = shadow.querySelector('.cancel-button')

    okButton.addEventListener('click', this.okClick)

    cancelButton.addEventListener('click', this.cancelClick)

    this.updateModalDialog()

  }

  okClick = (e) => {
    e.stopPropagation()
    const event = new CustomEvent(this.okEvent || defaultEvents.okEvent)
    this.dispatchEvent(event)
  }

  cancelClick = (e) => {
    e.stopPropagation()
    const event = new CustomEvent(this.cancelEvent || defaultEvents.cancelEvent)
    this.dispatchEvent(event)
  }

  static get observedAttributes() {
    return ['is-opened', 'dialog-type', 'one-button']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'is-opened' || name === 'dialog-type' || name === 'one-button') {
      this.updateModalDialog()
    }
  }

  updateModalDialog() {
    const shadow = this.shadowRoot;
    const isOpened = this.getAttribute('is-opened') === 'true'
    const isOneButton = this.getAttribute('one-button') === 'true'
    const dialogType = this.getAttribute('dialog-type')
    const dialog = shadow.querySelector('.modal-dialog')
    const cancelButton = shadow.querySelector('.cancel-button')

    const dialogWrapper = shadow.querySelector('.modal-dialog-wrapper')

    if (isOpened) {
      dialog.setAttribute('class', 'modal-dialog opened')
    } else {
      dialog.setAttribute('class', 'modal-dialog')
    }

    if (dialogType) {
      dialogWrapper.setAttribute('class', `modal-dialog-wrapper ${dialogType}`)
    } else {
      dialogWrapper.setAttribute('class', 'modal-dialog-wrapper')
    }

    if (isOneButton) {
      cancelButton.setAttribute('class', 'cancel-button hide')
    } else {
      cancelButton.setAttribute('class', 'cancel-button')
    }

  }

}

customElements.define('modal-dialog', ModalDialog)

