import { printToDiv } from './tools'

class Example {
    constructor (data){
        this.data = data
    }
    getData(){
        printToDiv(`getData ===> ${this.constructor.name} ${this.data}`)
        return this.data
    }
}

const example1 = new Example('example1')
const example2 = new Example('example2')


example1.getData()

example1.getData.call(example2)

//document.getElementById('button').addEventListener('click', example1.getData)
//document.getElementById('button').addEventListener('click', example1.getData.bind(example1))
document.getElementById('button').addEventListener('click', example1.getData.bind(example2))

setTimeout(example1.getData, 1000)


