// REFLECT

const target = {
    message: 'hello',
    source: 'myObject',
}

const handler = {
    get:  (obj, prop, receiver) => {
        if(prop === 'message'){
            console.log('getting message')
            return Reflect.get(obj, prop, receiver)
        } else if(prop === 'source'){
            return new Map()
        } else {
            return 'nothing'
        }
    },
    set: (obj, prop, value, receiver) => {
        if(prop === 'message'){
            console.log(`setting message, value = ${value}`)
            return Reflect.set(obj, prop, value, receiver)
        } else if(prop === 'source'){
            console.log(`you can not change source`)
            return true
        } else {
            throw Error('property name is wrong')
        }
    }
}

const logger = {
    get: (obj, prop, receiver) => {
        console.log(`getting property name = ${prop}`)
        return Reflect.get(obj, prop, receiver)
    },
    set: (obj, prop, value, receiver) => {
        console.log(`setting property name = ${prop}, value = ${value}`)
        return Reflect.set(obj, prop, value, receiver)
    }
}

export default function code1(){
    const proxy = new Proxy({}, logger)

    proxy.name = 'John'
    proxy.age = '40'

    const age = proxy.age

}