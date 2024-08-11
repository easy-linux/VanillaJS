const name = 'Symbol.iterator'

const run = () => {
    const rangeFabric = (start, end, step) => ({
        start, 
        end,
        [Symbol.iterator]() {
            return {
              current: this.start,
              last: this.end,
              next() {
                if (this.current <= this.last) {
                  const value = this.current
                  this.current += step
                  return { done: false, value };
                } else {
                  return { done: true };
                }
              }
            };
          }
    })
    const range = rangeFabric(1, 100, 1)


    console.clear()
    console.log(name)
    console.log(...range)
}

export default {
    name,
    run,
}