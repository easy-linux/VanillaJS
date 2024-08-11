const name = 'Symbol.toStringTag'

const run = () => {
    console.clear()
    console.log(name)
    
    class CustomCollection {
      constructor(items) {
        this.items = items;
      }
    
      get [Symbol.toStringTag]() {
        return 'CustomCollection';
      }
    }

    const myCollection = new CustomCollection([1, 2, 3]);

    console.log('myCollection', `${myCollection}`)

    const obj = {
      [Symbol.toStringTag]: 'MySpecialObject'
    };
    
    console.log('MySpecialObject', `${obj}`)


}

export default {
    name,
    run,
}