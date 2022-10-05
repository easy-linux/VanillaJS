
const doIt = (text) => () => console.log(text);

const startMacro = (func) => {
  setTimeout(func);
};

const startMicro = (func) => {
  queueMicrotask(func);
};

const onClick = () => {
  for (let i = 0; i < 10; i++) {
    doIt("macro 1 " + i)();
    startMacro(doIt("macro 2 - " + i));
    
    startMicro(doIt("> MICRO - " + i));

    Promise.resolve().then(doIt("promise 4 - " + i));

    fetch('https://jsonplaceholder.typicode.com/todos/1').then(doIt("promise fetch - " + i))

    // startMicro(()=>fetch('https://jsonplaceholder.typicode.com/todos/1')
    //     .then(doIt("promise fetch micro - " + i)))

    const p = new Promise((resolve) => {
        setTimeout(()=>resolve('ok'), 5000)
    })
    p.then(doIt("promise with 5sec delay - " + i))
  }

};

document.querySelector("#btn").addEventListener("click", onClick);