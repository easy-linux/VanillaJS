class AppComponent extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div')
    wrapper.setAttribute('class', 'app-block');

    wrapper.innerHTML = `
    <div class="app">
      <h2> Main Page </h2>
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
  }

}

customElements.define('app-component', AppComponent)

