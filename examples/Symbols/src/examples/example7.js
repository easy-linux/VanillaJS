const name = 'Symbol.isConcatSpreadable'

const run = () => {
    console.clear()
    console.log(name)

    const arr1 = [1, 2, 3];
    const arr2 = [4, 5];

    console.log('arr1.concat(arr2)', arr1.concat(arr2)); 

    const obj = { 0: 'a', 1: 'b', length: 2 };

    console.log('arr1.concat(obj)', arr1.concat(obj)); 


    arr2[Symbol.isConcatSpreadable] = false;
    console.log('arr1.concat(arr2) Symbol.isConcatSpreadable === false', arr1.concat(arr2)); 
    obj[Symbol.isConcatSpreadable] = true;
    console.log('arr1.concat(obj) Symbol.isConcatSpreadable === true', arr1.concat(obj));
}

export default {
    name,
    run,
}