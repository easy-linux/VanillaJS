
import { grayscale, invert_colors, blur, sobel } from "wasm_image_editor";

export const grayscaleWASM = (imageData) => {
    const { data, width, height } = imageData;
    const processed = grayscale(data)
    return new ImageData(
        new Uint8ClampedArray(processed),
        width,
        height
    );
}

export const invertColorsWASM = (imageData) => {
    const { data, width, height } = imageData;
    const processed = invert_colors(data);
    return new ImageData(
        new Uint8ClampedArray(processed),
        width,
        height
    );
}

export const blurWASM = (imageData, radius = 10) => {
    const { data, width, height } = imageData;
    const processed = blur(data, width, height, radius);
    return new ImageData(
        new Uint8ClampedArray(processed),
        width,
        height
    );
}

export const sobelWASM = (imageData) => {
    const { data, width, height } = imageData;
    const processed = sobel(data, width, height);
    return new ImageData(
        new Uint8ClampedArray(processed),
        width,
        height
    );
}

export const grayscaleJS = (imageData) => {
    const { data, width, height } = imageData;// Получаем массив RGBA
    const result = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Яркость рассчитывается как взвешенная сумма RGB
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        result[i] = result[i + 1] = result[i + 2] = gray; // Устанавливаем R, G, B
        result[i + 3] = data[i + 3]; // Копируем альфа-канал
    }

    return new ImageData(result, width, height);
}

export const invertColorsJS = (imageData) => {
    const { data, width, height } = imageData; // Получаем массив RGBA
    const result = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        result[i] = 255 - data[i];     // Инвертируем R
        result[i + 1] = 255 - data[i + 1]; // Инвертируем G
        result[i + 2] = 255 - data[i + 2]; // Инвертируем B
        result[i + 3] = data[i + 3];   // Копируем альфа-канал
    }

    return new ImageData(result, width, height);
}

export const blurJS = (imageData, radius = 10) => {
    const { data, width, height } = imageData;
    const result = new Uint8ClampedArray(data.length);
  
    const kernelSize = radius * 2 + 1;
    const kernelArea = kernelSize * kernelSize;
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
  
        // Суммируем цвета в квадратной области (kernel)
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx));
            const py = Math.min(height - 1, Math.max(0, y + ky));
            const idx = (py * width + px) * 4;
  
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
          }
        }
  
        // Среднее значение цветов
        const idx = (y * width + x) * 4;
        result[idx] = r / kernelArea;
        result[idx + 1] = g / kernelArea;
        result[idx + 2] = b / kernelArea;
        result[idx + 3] = a / kernelArea;
      }
    }
  
    return new ImageData(result, width, height);
  }

  export const sobelJS = (imageData) => {
    const { data, width, height } = imageData;
    const result = new Uint8ClampedArray(data.length);
  
    // Горизонтальное ядро (для оси X)
    const sobelX = [
      -1, 0, 1,
      -2, 0, 2,
      -1, 0, 1
    ];
  
    //Вертикальное ядро (для оси Y)
    const sobelY = [
      -1, -2, -1,
       0,  0,  0,
       1,  2,  1
    ];
  
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
  
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = x + kx;
            const py = y + ky;
            const idx = (py * width + px) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            // градиент по оси Х
            gx += gray * sobelX[kernelIdx];
            // градиент по оси Y
            gy += gray * sobelY[kernelIdx];
          }
        }
  
        // вычисляем величину градиента (показывает интенсивность изменений или контраст изображения)
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        // вычисляем индекс пикселя
        const idx = (y * width + x) * 4;
        // если у точки высокая контрастность задаем точке белый цвет, если нет - то значение равное градиенту
        result[idx] = result[idx + 1] = result[idx + 2] = magnitude > 255 ? 255 : magnitude;
        result[idx + 3] = 255; // Альфа-канал
      }
    }
  
    return new ImageData(result, width, height);
  }