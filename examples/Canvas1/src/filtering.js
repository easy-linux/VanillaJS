export const filters = [
    { id: 'opacity', min: 0, max: 100, value: 100, label: 'Непрозрачность', units: '%' },
    { id: 'brightness', min: 0, max: 300, value: 100, label: 'Яркость', units: '%' },
    { id: 'contrast', min: 0, max: 300, value: 100, label: 'Контрастность', units: '%' },
    { id: 'saturate', min: 0, max: 300, value: 100, label: 'Насыщенность', units: '%' },
    { id: 'hue-rotate', min: -180, max: 180, value: 0, label: 'Вращение оттенка', units: 'Deg' },
    { id: 'sepia', min: 0, max: 100, value: 0, label: 'Сепия', units: '%' },
    { id: 'blur', min: 0, max: 10, value: 0, label: 'Размытие', units: 'px' },
    { id: 'invert', min: 0, max: 100, value: 0, label: 'Инверсия', units: '%' },
    { id: 'grayscale', min: 0, max: 100, value: 0, label: 'Оттенки серого', units: '%' },
]

const filtersBlock = document.querySelector('.filters')
const filtersValue = {}

filters.forEach((input) => {
    const divCell = document.createElement('div')
    divCell.setAttribute('class', 'cell')
    const label = document.createElement('label')
    label.setAttribute('class', 'label')
    label.setAttribute('for', input.id)
    label.textContent = input.label
    divCell.appendChild(label)

    const i = document.createElement('input')
    i.setAttribute('type', 'range')
    i.setAttribute('id', input.id)
    i.setAttribute('min', input.min)
    i.setAttribute('max', input.max)
    i.setAttribute('value', input.value)
    divCell.appendChild(i)

    const span = document.createElement('span')
    span.innerHTML = `<span id="${input.id}-text">${input.value}</span><span>${input.units}</span>`
    divCell.appendChild(span)
    filtersBlock.appendChild(divCell)
})

let timeout = null
export const changeFilter = (input, img) => {
    if (timeout) {
        return
    }
    timeout = setTimeout(() => {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
        
            const value = +input.value
            const id = input.id

            const text = document.querySelector(`#${id}-text`)
            text.textContent = value
            const data = filters.find((i) => i.id === id)
            filtersValue[id] = `${value}${data.units}`
            ctx.filter = Object.entries(filtersValue).map(([key, value]) => {
                return `${key}(${value})`
            }).join(' ')
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        }
        timeout = null
    }, 100)
}

export const resetFilter = (img) => {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.filter = 'none'
        const keys = Object.keys(filtersValue)
        keys.forEach((k) => {
            delete filtersValue[k]
        })

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        filters.forEach((input) => {
            const i = document.querySelector(`#${input.id}`)
            const text = document.querySelector(`#${input.id}-text`)
            i.value = input.value
            text.textContent = input.value
        })
    }
}
