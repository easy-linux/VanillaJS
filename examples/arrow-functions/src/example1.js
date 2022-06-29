import { printToDiv } from './tools'

class Example {
    constructor (data){
        this.data = data
    }
}

const example1 = new Example('example1')
const example2 = new Example('example2')

const getData = function(){
    printToDiv(`getData ===> ${this.constructor.name} ${this.data}`)
    return this.data
}

example1.getData = getData

example1.getData()

example1.getData.call(example2)

document.getElementById('button').addEventListener('click', example1.getData.bind(example1))

setTimeout(example1.getData.bind(example1), 1000)


