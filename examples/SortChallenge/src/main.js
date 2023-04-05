import { addData } from "./chartEngine";
import bubbleSort from "./algorithms/bubbleSort";
import btreeSort from "./algorithms/binaryTreeSort";
import cocktailSort from "./algorithms/coctailSort";
import combSort from "./algorithms/combSort";
import gnomeSort from "./algorithms/gnomeSort";
import heapSort from "./algorithms/heapSort";
import insertionSort from "./algorithms/insertionSort";
import introSort from "./algorithms/introSort";
import mergeSort from "./algorithms/mergeSort";
import quickSort from "./algorithms/quickSort";
import selectionSort from "./algorithms/selectionSort";
import stoogeSort from "./algorithms/stoogeSort";
import smoothSort from "./algorithms/smoothSort";
import timsort from "./algorithms/timSort";
import quickJsSort from "./algorithms/quickJsSort";

const allFunc = [
    { func: bubbleSort, name: 'Пузырьковая' },
    { func: btreeSort, name: 'Двоичными деревьями' },
    { func: cocktailSort, name: 'Перемешиванием' },
    { func: combSort, name: 'Расческой' },
    { func: gnomeSort, name: 'Гномья' },
    { func: heapSort, name: 'Пирамидальная' },
    { func: insertionSort, name: 'Вставкой' },
    { func: introSort, name: 'Интроспективная' },
    { func: mergeSort, name: 'Слиянием' },
    { func: quickSort, name: 'Быстрая' },
    { func: selectionSort, name: 'Выборкой' },
    { func: stoogeSort, name: 'Придурковатая' },
    { func: smoothSort, name: 'Плавная' },
    { func: timsort, name: 'Timsort' },
    { func: quickJsSort, name: 'quickJsSort' },
]


const arr = [];
console.log('Source array generating ==>> start')
for (let i = 0; i < 1000; i++) {
    arr.push(Math.floor(Math.random() * 1000000) + 1);
}

console.log('Source array generating ==>> end')

const doIt = (method, name) => {
    const t0 = performance.now();
    method([...arr])
    const t2 = performance.now();
    console.log(name, t2 - t0)
    addData(name, t2 - t0)
}


let arrayPosition = 0
const length = allFunc.length

const doStep = () => {
    if (arrayPosition === length) {
        return
    }
    const action = allFunc[arrayPosition]
    console.log(action.name, '==>> start')
    doIt(action.func, action.name)
    console.log(action.name, '==>> end')
    arrayPosition = arrayPosition + 1
    setTimeout(doStep, 0)
}

doStep()

