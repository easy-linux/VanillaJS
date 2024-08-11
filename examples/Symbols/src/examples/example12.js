const name = 'Symbol.species'

const run = () => {
    console.clear()
    console.log(name)

    class MyArray extends Array {
      // static get [Symbol.species]() {
      //   return Array;
      // }
    }
    
    const myArray = new MyArray(1, 2, 3, 4);
    const slicedArray = myArray.slice(1, 3);
    
    console.log('slicedArray instanceof MyArray', slicedArray instanceof MyArray); 
    console.log('slicedArray instanceof Array', slicedArray instanceof Array);   
}

export default {
    name,
    run,
}