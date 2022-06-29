import { printToDiv } from './tools'

const Example = {
    data: 'Example5',
    init(){
        this.getData = () => {
            if(this){
                printToDiv(`getData ===> ${this.constructor.name} ${this.data}`)
                return this.data
            } else {
                printToDiv(`getData ===> I don't see any "this" here!`)
            }
        }
    },
}

Example.init()
Example.getData()
Example.getData.call({data: 'bla-bla-bla'})

document.getElementById('button').addEventListener('click', Example.getData.bind({data: 'bla-bla-bla'}))

setTimeout(Example.getData, 1000)


