const name = 'example1'

const run = () => {
    const sym1 = Symbol();
    const sym2 = Symbol('description');

    console.clear()
    console.log(name)
    
    console.log(sym1);
    console.log(sym2);
}

export default {
    name,
    run,
}