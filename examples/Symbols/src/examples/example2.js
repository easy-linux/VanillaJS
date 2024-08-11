const name = 'example2'

const run = () => {
    const sym1a = Symbol();
    const sym1b = Symbol();
    const sym2a = Symbol('description');
    const sym2b = Symbol('description');

    console.clear()
    console.log(name)
    
    console.log('sym1', sym1a === sym1b);
    console.log('sym2', sym2a === sym2b);
}

export default {
    name,
    run,
}