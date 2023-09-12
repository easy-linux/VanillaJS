import { addData, clearData } from "./chartEngine";
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
    { id: 'bubbleSort', func: bubbleSort, name: 'Пузырьковая' },
    { id: 'btreeSort', func: btreeSort, name: 'Двоичными деревьями' },
    { id: 'cocktailSort', func: cocktailSort, name: 'Перемешиванием' },
    { id: 'combSort', func: combSort, name: 'Расческой' },
    { id: 'gnomeSort', func: gnomeSort, name: 'Гномья' },
    { id: 'heapSort', func: heapSort, name: 'Пирамидальная' },
    { id: 'insertionSort', func: insertionSort, name: 'Вставкой' },
    { id: 'introSort', func: introSort, name: 'Интроспективная' },
    { id: 'mergeSort', func: mergeSort, name: 'Слиянием' },
    { id: 'quickSort', func: quickSort, name: 'Быстрая' },
    { id: 'selectionSort', func: selectionSort, name: 'Выборкой' },
    { id: 'stoogeSort', func: stoogeSort, name: 'Придурковатая' },
    { id: 'smoothSort', func: smoothSort, name: 'Плавная' },
    { id: 'timsort', func: timsort, name: 'Timsort' },
    { id: 'quickJsSort', func: quickJsSort, name: 'quickJsSort' },
]


const arr = [];

const generateSource = (count) => {
    console.log('Source array generating ==>> start')
    arr.length = 0
    for (let i = 0; i < count; i++) {
        arr.push(Math.floor(Math.random() * count) + 1);
    }

    console.log('Source array generating ==>> end')
}

const doIt = (method, name) => {
    const t0 = performance.now();
    method([...arr])
    const t2 = performance.now();
    console.log(name, t2 - t0)
    addData(name, t2 - t0)
}

const timeOutDelay = 200;

let formOptions = {}
let arrayPosition = 0
const length = allFunc.length

const doStep = () => {
    if (arrayPosition === length) {
        return
    }
    const action = allFunc[arrayPosition]
    arrayPosition = arrayPosition + 1
    if (formOptions[action.id] === 'on') {
        console.log(action.name, '==>> start')
        doIt(action.func, action.name)
        console.log(action.name, '==>> end')
    } else {
        doStep()
    }

    //setTimeout(doStep, timeOutDelay)
}


//doStep()

window.addEventListener('animation-complete', doStep)


const form = document.getElementById('form')
const checks = document.getElementById('check-boxes')

allFunc.forEach((al) => {
    const container = document.createElement('div')
    container.setAttribute('class', 'checkbox-container')
    const checkBox = document.createElement('input')
    const label = document.createElement('label')
    checkBox.type = 'checkbox'
    checkBox.name = al.id
    checkBox.id = al.id
    checkBox.checked = true
    label.setAttribute('for', al.id)
    label.style.marginLeft = '20px'
    label.textContent = al.name
    container.appendChild(label)
    container.appendChild(checkBox)
    checks.appendChild(container)
})

form.addEventListener('submit', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const formData = new FormData(e.target);
    formOptions = Object.fromEntries(formData)
    console.log(Object.fromEntries(formData));
    const count = parseInt(formData.get('count'))
    arrayPosition = 0
    generateSource(count)
    //setTimeout(doStep, timeOutDelay)
    clearData()
})

