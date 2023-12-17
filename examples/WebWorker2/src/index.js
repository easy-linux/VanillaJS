import { appConstants } from "./appConstants"

const workers = new Map()

const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 3); 
const int32Array = new Int32Array(sharedBuffer); 

const getWorkerBody = (workerTimeout, operation, name) => `
let sharedMem
let value0 = 0;
let inputIndex;
let timeout = ${workerTimeout};
let workerName = '${name}';

loop = () => {
      if(sharedMem){
         Atomics.wait(sharedMem, inputIndex, value0);
         value0 = sharedMem[inputIndex]
         const outputValue = ${operation}
         self.postMessage(outputValue)
      }
      setTimeout(loop, timeout)
}

onmessage = (e) => {
   const { type } = e.data
   switch(type){
      case "set": {
         sharedMem = e.data?.mem
         inputIndex = e.data?.inputIndex
         break;
      }
   }
   value0 = sharedMem[inputIndex]
   loop()
}
console.log('worker ${name} with operation ${operation}');
`

// common function to handle messages from worker 
const onWorkerMessage = (e, settings) => {
   const {name, output} = settings
   console.log(name, e)
   document.querySelector(`.${output}`).textContent = e.data
}

// function to re-create worker with new expression
const reCreateWorker = (settings) => {
   const {name, expInput, timeout, inputIndex} = settings
   if(workers.has(name)){
      workers.get(name).terminate()
      workers.delete(name)
   }
  
   const exp = document.querySelector(`.${expInput}`).value
   const blob = new Blob([getWorkerBody(timeout, exp, name)], {type: 'text/javascript'})
   const worker = new Worker(URL.createObjectURL(blob))
   workers.set(name, worker)

   worker.addEventListener('message', (e) => onWorkerMessage(e, settings))
   worker.postMessage({type: 'set', mem: int32Array, inputIndex: inputIndex})
}

// create workers with default expressions
reCreateWorker(appConstants.workers.worker1)
reCreateWorker(appConstants.workers.worker2)
reCreateWorker(appConstants.workers.worker3)

// getting elements to add handlers
const expressions = document.querySelector('.row-expression')
const work = document.querySelector('.row-work')

// element to show current value in SharedArray [0], [1], [2]
const output0 = document.querySelector('.result0')

// function to rewrite values in [0], [1], [2] that are shared with workers
const callAtomicMethod = (method, value, value2) => {
      const oldValue = Atomics.load(int32Array, 0)
      Atomics[method](int32Array, 0, value, value2)
      Atomics[method](int32Array, 1, value, value2)
      Atomics[method](int32Array, 2, value, value2) 
      const newValue = Atomics.load(int32Array, 0)
      if(oldValue !== newValue){
         if(['and', 'or', 'xor'].indexOf(method) !== -1){
            console.log(oldValue.toString(2).padStart(10, '0'))
            console.log(value.toString(2).padStart(10, '0'))
            console.log(newValue.toString(2).padStart(10, '0'))
         }
         output0.textContent = newValue
         Atomics.notify(int32Array, 0, 1)
         Atomics.notify(int32Array, 1, 1)
         Atomics.notify(int32Array, 2, 1)
      }
}

// common click handler for all supported operations 
const onClick = (method, input, input2) => {
   if(input){
      const value = input.value
      const num = parseInt(`${value}`, 10)
      if(input2){
         const value2 = input2.value
         const num2 = parseInt(`${value2}`, 10)
         callAtomicMethod(method, num, num2)
      } else {
         callAtomicMethod(method, num)
      }
   }
}

// add handler to change worker's expression
if(expressions){
   expressions.addEventListener('click', (e) => {
      const target = e.target
      const type = target.getAttribute('data-type')
      if(type){
         switch(type){
            case appConstants.workers.worker1.name: {
               reCreateWorker(appConstants.workers.worker1)
               break;
            }
            case appConstants.workers.worker2.name: {
               reCreateWorker(appConstants.workers.worker2)
               break;
            }
            case appConstants.workers.worker3.name: {
               reCreateWorker(appConstants.workers.worker3)
               break;
            }
         }
      }
   })
}

// add handler to apply atomics operation
if(work){
   work.addEventListener('click', (e) => {
      const target = e.target
      const op = target.getAttribute('data-op')
      if(op){
         const input1 = document.querySelector(`.${op}-value`)
         const input2 = document.querySelector(`.${op}-value2`)
         if(input2){
            onClick(op, input1, input2)
         } else {
            onClick(op, input1)
         }

      }
   })
}