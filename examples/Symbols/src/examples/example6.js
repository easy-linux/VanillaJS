const name = 'Symbol.hasInstance'

const run = () => {
    console.clear()
    console.log(name)

    class MyClass {
        static [Symbol.hasInstance](instance) {
          return 'customProperty' in instance;
        }
      }
      
      const obj1 = { customProperty: 123 };
      const obj2 = { anotherProperty: 456 };
      console.log('obj1', obj1);
      console.log('obj1 instanceof MyClass',  obj1 instanceof MyClass); 
      console.log('obj2', obj2);
      console.log('obj2 instanceof MyClass', obj2 instanceof MyClass); 
}

export default {
    name,
    run,
}