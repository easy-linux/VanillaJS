const name = 'Symbol.toPrimitive'

const run = () => {
    console.clear()
    console.log(name)
    
    const obj1 = {
      value: 10,
      name: 'obj1',
    }
    const obj2 = {
      value: 20,
      name: 'obj2',
    }

    console.log('obj1 * obj2', obj1 * obj2)

    const toPrimitive = function(hint){
        switch (hint) {
          case 'string':
            return this.name;
          case 'number':
            return this.value;
          default:
            return this.value;
        }
    };

    obj1[Symbol.toPrimitive] = toPrimitive
    obj2[Symbol.toPrimitive] = toPrimitive

    console.log('obj1 * obj2 with Symbol.toPrimitive', obj1 * obj2)
    console.log('obj1 * obj2 with Symbol.toPrimitive', `name=${obj1} name=${obj2}`)
}

export default {
    name,
    run,
}