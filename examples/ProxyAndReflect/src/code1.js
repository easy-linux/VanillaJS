// PROXY

const target = {
    message: 'hello',
    source: 'myObject',
}

const handler = {
    get:  (obj, prop) => {
        if(prop === 'message'){
            console.log('getting message')
            return obj[prop]
        } else if(prop === 'source'){
            return new Map()
        } else {
            return 'nothing'
        }
    },
    set: (obj, prop, value) => {
        if(prop === 'message'){
            console.log(`setting message, value = ${value}`)
            obj[prop] = value
            return true
        } else if(prop === 'source'){
            console.log(`you can not change source`)
            return true
        } else {
            throw new Error('property name is wrong')
        }
    }
}

export default function code1(){
    const proxy = new Proxy(target, handler)

    const msg = proxy.message
    console.log('===> msg', msg)
    proxy.message = 'new message'
    
    
    const source = proxy.source
    console.log('===> source', source)
    proxy.source = 'source'

    const data = proxy.data
    console.log('===> data', data)
    proxy.data = 'new data'
}