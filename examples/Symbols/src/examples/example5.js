const name = 'Symbol.asyncIterator'

const run = async () => {
    const asyncRangeFabric = (start, end, step) => ({
        start, 
        end,
        [Symbol.asyncIterator]() {
            return {
              current: this.start,
              last: this.end,
              next: async function () {
                if (this.current <= this.last) {
                  const value = this.current
                  this.current += step
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  return { done: false, value };
                } else {
                  return { done: true };
                }
              }
            };
          }
    })
    const asyncRange = asyncRangeFabric(1, 100, 1)


    console.clear()
    console.log(name)

    for await (let value of asyncRange) {
        console.log(value); 
    }
}

export default {
    name,
    run,
}