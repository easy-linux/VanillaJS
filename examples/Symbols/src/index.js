import { examples } from './examples';
const buttons = document.getElementById('buttons');

if(Array.isArray(examples)){
    examples.forEach((example) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = example.name
        btn.addEventListener('click', example.run);
        buttons.appendChild(btn);
    })
}

