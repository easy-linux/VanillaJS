const name = 'Symbol.match'

const run = () => {
    console.clear()
    console.log(name)

    class CustomMatcher {
        constructor(value) {
          this.value = value;
        }
      
        [Symbol.match](string) {
          const index = string.indexOf(this.value);
          return index === -1 ? { found: false} : {position: index, found: true, value: this.value};
        }
    }
      
    const matcher = new CustomMatcher('hello');
    
    const result1 = 'hello world'.match(matcher); 
    console.log("'hello world'.match(matcher)", result1); 
    
    const result2 = 'goodbye world'.match(matcher); 
    console.log("'goodbye world'.match(matcher)", result2); 
}

export default {
    name,
    run,
}