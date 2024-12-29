import init from "wasm_image_editor";
import { grayscaleWASM, invertColorsWASM, blurWASM, 
  sobelWASM, grayscaleJS, invertColorsJS, blurJS, sobelJS } from './tools'

init(); // Инициализация WASM

const Render = () => {
  let imageSrc = null
  const root = document.querySelector('#root')
  const inputFile = document.querySelector('#input-file')
  const canvas = document.querySelector('#canvas')
  const output = document.querySelector('#output')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      imageSrc = URL.createObjectURL(file);
      drawOriginal()
    }
  };

  inputFile.addEventListener('change', handleFileUpload)

  const drawOriginal = () => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    }

  }

  const processImage = async (filter, isWasm) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const typeText = isWasm ? 'WASM' : 'JS'

    console.time(`${filter} ${typeText}`);
    const start = performance.now();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let processFunction;

    switch (filter) {
      case 'grayscale': {
        processFunction = isWasm ? grayscaleWASM : grayscaleJS;
        break;
      }
      case 'invert': {
        processFunction = isWasm ? invertColorsWASM : invertColorsJS;
        break;
      }
      case 'blur': {
        processFunction = isWasm ? blurWASM : blurJS;
        break;
      }
      case 'filter': {
        processFunction = isWasm ? sobelWASM : sobelJS;
        break;
      }
      default: {
        processFunction = isWasm ? grayscaleWASM : grayscaleJS;
        break;
      }
    }

    const newImageData = processFunction(imageData);
    ctx.putImageData(newImageData, 0, 0);
    console.timeEnd(`${filter} ${typeText}`);
    const end = performance.now();
    const result = document.createElement('div')
    result.textContent = `${filter} ${typeText}: ${end - start} ms`
    output.appendChild(result)
  };


  root.addEventListener('click', (e) => {
    const target = e.target;
    if (target?.dataset?.type) {
      if (target.dataset.func) {
        processImage(target.dataset.func, target.dataset.type === 'wasm')
      } else {
        drawOriginal()
      }

    }
  })

};

Render();
