import { createElement, start } from './core/mini-react';
import { Counter } from './components/Counter';
import { html } from './core/html';

export function App() {
  // return createElement('div', null,
  //   createElement('h1', null, 'Мой мини-React'),
  //   createElement(Counter)
  // );

    // Или с использованием JSX
    return html`<div>
    <h1>Мой мини-React</h1>
    <${Counter} />
    <${Counter} />
    <div>
    <${Counter} />
    </div>
    </div>`
}

start(App, document.getElementById('root'));
