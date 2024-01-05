import { resetFilter, changeFilter } from './filtering'
import './styles/main.scss'

const input = document.querySelector('#file-input')
const container = document.querySelector('#container')

let currentImage;

input.addEventListener('change', (e) => {
    const input = e.target
    if (!input.files || input.files.length === 0) {
        alert('Надо бы выбрать файл.');
        return;
    }

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
        alert('Я работаю только с изображениями');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = function () {

            const imageSize = {
                width: img.width,
                height: img.height
            };
            console.log(`Image size: ${imageSize.width} x ${imageSize.height}`);

            let canvas = document.getElementById('canvas');
            if (canvas) {
                canvas.remove()
            }
            canvas = document.createElement('canvas')
            canvas.setAttribute('id', 'canvas')
            canvas.setAttribute('width', imageSize.width)
            canvas.setAttribute('height', imageSize.height)

            canvas.style.border = '1px solid #f00'
            container.appendChild(canvas)

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, imageSize.width, imageSize.height);
            ctx.drawImage(img, 0, 0, imageSize.width, imageSize.height);
            currentImage = img
        };
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
})

document.querySelector('#reset-btn').addEventListener('click', () => {
    resetFilter(currentImage)
})

document.querySelector('.filters').addEventListener('input', (e) => {
    const input = e.target
    if (input.getAttribute('type') === 'range') {
        changeFilter(input, currentImage)
    }
})


document.querySelector('#download-btn').addEventListener('click', () => {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        // Получение URL изображения в формате base64
        const dataURL = canvas.toDataURL('image/png');

        // Создание ссылки для скачивания
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'canvas_image.png';

        // Добавление ссылки в документ
        document.body.appendChild(downloadLink);

        // Клик по ссылке для запуска скачивания
        downloadLink.click();

        // Удаление ссылки из документа (необязательно)
        document.body.removeChild(downloadLink);
    }
})
