# Пример создания WASM модуля на языке Rust

О том как это все работает можно посмотреть здесь:

![Видео здесь](https://img.youtube.com/vi/DnWZ-b_iMiU/0.jpg)](https://www.youtube.com/watch?v=DnWZ-b_iMiU)


# Шаг 1. Установка необходимых инструментов

## 1. Установите Rust

Скачайте и установите Rust через Rustup:
```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Убедитесь, что Rust установлен:

```
rustc --version
```

## 2. Установите wasm-pack

wasm-pack упрощает создание и компиляцию WebAssembly модулей:

```
cargo install wasm-pack
```

# Шаг 2. Создание Rust-кода

## 1. Создайте новый Rust-проект

Используйте шаблон библиотеки:

```
cargo new --lib wasm_image_editor
cd wasm_image_editor
cargo add wasm-bindgen
```

## 2. Настройте Cargo.toml

Убедитесь что в файле Cargo.toml присутствуют следующие зависимости (версии могут быть другие) и добавьте разделы `lib` и `profile.release`:

```
[dependencies]
wasm-bindgen = "0.2"

[lib]
crate-type = ["cdylib"]

[profile.release]
lto = true
```

- wasm-bindgen: Позволяет взаимодействовать с WebAssembly из JavaScript.

## 3. Реализация логики в src/lib.rs

```
use wasm_bindgen::prelude::*;

// Указываем, что эта функция будет доступна из JavaScript
#[wasm_bindgen]
pub fn grayscale(image_data: Vec<u8>) -> Vec<u8> {
    
    let mut result = vec![0; image_data.len()];

    for i in (0..image_data.len()).step_by(4) {
        // Извлекаем значения R, G, B
        let r = image_data[i] as f32;
        let g = image_data[i + 1] as f32;
        let b = image_data[i + 2] as f32;

        // Рассчитываем яркость
        let gray = (0.299 * r + 0.587 * g + 0.114 * b) as u8;

        // Устанавливаем одинаковое значение для R, G, B
        result[i] = gray;
        result[i + 1] = gray;
        result[i + 2] = gray;

        // Копируем альфа-канал
        result[i + 3] = image_data[i + 3];
    }

    result
}

#[wasm_bindgen]
pub fn invert_colors(image_data: Vec<u8>) -> Vec<u8> {
    let mut result = vec![0; image_data.len()];

    for i in (0..image_data.len()).step_by(4) {
        // Инвертируем R, G, B
        result[i] = 255 - image_data[i];
        result[i + 1] = 255 - image_data[i + 1];
        result[i + 2] = 255 - image_data[i + 2];

        // Копируем альфа-канал
        result[i + 3] = image_data[i + 3];
    }

    result
}

#[wasm_bindgen]
pub fn blur(image_data: Vec<u8>, width: u32, height: u32, radius: u32) -> Vec<u8> {
    let mut result = image_data.clone();
    let kernel_size = radius as usize * 2 + 1;
    let kernel_area = (kernel_size * kernel_size) as u32;

    for y in 0..height {
        for x in 0..width {
            let mut r = 0u32;
            let mut g = 0u32;
            let mut b = 0u32;
            let mut a = 0u32;

            for ky in -(radius as i32)..=(radius as i32) {
                for kx in -(radius as i32)..=(radius as i32) {
                    let px = (x as i32 + kx).clamp(0, (width - 1) as i32) as u32;
                    let py = (y as i32 + ky).clamp(0, (height - 1) as i32) as u32;
                    let idx = (py * width + px) as usize * 4;

                    r += image_data[idx] as u32;
                    g += image_data[idx + 1] as u32;
                    b += image_data[idx + 2] as u32;
                    a += image_data[idx + 3] as u32;
                }
            }

            let idx = (y * width + x) as usize * 4;
            result[idx] = (r / kernel_area) as u8;
            result[idx + 1] = (g / kernel_area) as u8;
            result[idx + 2] = (b / kernel_area) as u8;
            result[idx + 3] = (a / kernel_area) as u8;
        }
    }

    result
}

#[wasm_bindgen]
pub fn sobel(image_data: Vec<u8>, width: u32, height: u32) -> Vec<u8> {
    let mut result = vec![0; image_data.len()];
    let sobel_x = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    let sobel_y = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for y in 1..(height - 1) {
        for x in 1..(width - 1) {
            let mut gx = 0.0;
            let mut gy = 0.0;

            for ky in -1..=1 {
                for kx in -1..=1 {
                    let px = (x as i32 + kx) as u32;
                    let py = (y as i32 + ky) as u32;
                    let idx = (py * width + px) as usize * 4;

                    let gray = 0.299 * image_data[idx] as f32
                        + 0.587 * image_data[idx + 1] as f32
                        + 0.114 * image_data[idx + 2] as f32;

                    let kernel_idx = ((ky + 1) * 3 + (kx + 1)) as usize;
                    gx += gray * sobel_x[kernel_idx] as f32;
                    gy += gray * sobel_y[kernel_idx] as f32;
                }
            }

            let magnitude = ((gx * gx + gy * gy).sqrt() as u8).min(255);
            let idx = (y * width + x) as usize * 4;
            result[idx] = magnitude;
            result[idx + 1] = magnitude;
            result[idx + 2] = magnitude;
            result[idx + 3] = 255;
        }
    }

    result
}

```

# Шаг 3. Компиляция Rust в WASM

Скомпилируйте Rust-код в WebAssembly с помощью wasm-pack:

```
wasm-pack build --target web
```

После успешной сборки появится директория pkg, содержащая WebAssembly модуль и сгенерированный JavaScript-код для интеграции.

# Шаг 4. Настройка фронтенда

## 1. Установите WASM пакет из локального каталога:

Убедитесь, что Вы находитесь в корневом каталоге проекта и затем установите WASM пакет с помощью команды:

```
npm i ./wasm_image_editor/pkg
```

## 2. Отредактируйте index.js (или другой файл, где производится вызов импортируемых функций):

```

import init from "wasm_image_editor";
import { grayscale, invert_colors, blur, sobel } from "wasm_image_editor";

init(); // Инициализация WASM

```

# Шаг 2. Запуск проекта

## 1.	Убедитесь, что вы находитесь в корневой папке проекта.
## 2.	Запустите приложение:

```
npm run dev
```

## 3.	Откройте в браузере по адресу http://localhost:3000.


# Шаг 6. Проверка производительности

Попробуйте обработать большое изображение и сравните информацию о затраченном на обработку времени. 

