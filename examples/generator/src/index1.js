import {GetGenerator} from './generator1.js'

const output = document.querySelector('.output')
if(output){
    const gen = GetGenerator('Iteration')
    let data = gen.next()
    while(!data.done){
         const div = document.createElement('div')
         div.textContent = data.value
         output.appendChild(div)
         data = gen.next()
    }
}