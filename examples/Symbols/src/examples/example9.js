const name = 'CustomStringProcessor'

const run = () => {
    console.clear()
    console.log(name)
    class CustomStringProcessor {
        constructor(value) {
          this.value = value;
        }
      
        [Symbol.replace](string, replacement) {
          return string.split(this.value).join(replacement.toUpperCase());
        }
      
        [Symbol.search](string) {
          return string.indexOf(this.value);
        }
      
        [Symbol.split](string) {
          return string.split(this.value).map(part => `-${part}-`);
        }
      }
      
      const processor = new CustomStringProcessor('hello');
      

      const replaced = 'hello world, hello everyone'.replace(processor, 'hi');
      console.log("'hello world, hello everyone'.replace(processor, 'hi')", replaced); 
      
      const index = 'hello world, hello everyone'.search(processor);
      console.log("'hello world, hello everyone'.search(processor)", index);
      
      const split = 'hello world, hello everyone'.split(processor);
      console.log("'hello world, hello everyone'.split(processor)", split);
}

export default {
    name,
    run,
}