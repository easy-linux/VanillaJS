import { printToDiv } from './tools'

const Example = {
    data: 'Example4',
    getData1(){
        printToDiv(`getData ===> ${this.constructor.name} ${this.data}`)
        return this.data
    },
    getData2: function(){
        printToDiv(`getData ===> ${this.constructor.name} ${this.data}`)
        return this.data
    },
    getData3: () => {
        if(this){
            printToDiv(`getData ===> ${this.constructor.name} ${this.data}`)
            return this.data
        } else {
            printToDiv(`getData ===> I don't see any "this" here!`)
        }
        
    },
    getData4: function(){
        const getter = () => {
            if(this){
                printToDiv(`getData ===> ${this.constructor.name} ${this.data}`)
                return this.data
            } else {
                printToDiv(`getData ===> I don't see any "this" here!`)
            }
        }
        return getter()
    }

}


Example.getData4()
Example.getData4.call({data: 'bla-bla-bla'})

document.getElementById('button').addEventListener('click', Example.getData4)

setTimeout(Example.getData4, 1000)


