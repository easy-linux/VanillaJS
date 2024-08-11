const name = 'example3'

const run = () => {
    const propName = Symbol('propName')

    const myObject = {
        [propName]: 'initial',
        setValue(data){
            this[propName] = data;
        },
        getValue(){
            return this[propName];
        },
    };


    console.clear();
    console.log(name);

    myObject.setValue(12345);
    console.log('myObject.getValue', myObject.getValue());

    console.log('myObject', myObject);

    console.log('JSON.stringify', JSON.stringify(myObject, null, 4));
    const keys = Object.keys(myObject)
    console.log('Object.keys', keys, keys.map((k) => myObject[k]));

    console.log("myObject[Symbol('propName')]", myObject[Symbol('propName')]);
    console.log("myObject['Symbol(propName)']", myObject['Symbol(propName)']);

}

export default {
    name,
    run,
}