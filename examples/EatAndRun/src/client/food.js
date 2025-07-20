/**
 * @module Client/RenderFood
 * @category Client
 * @description Модуль рендеринга еды на canvas
 * 
 * Этот модуль содержит:
 * - Функцию renderFood для отрисовки всей еды
 * - Отрисовку еды как зеленых кругов
 * - Интеграцию с системой камеры для центрирования
 * - Получение данных еды из game.food
 * 
 * @example
 * import { renderFood } from './food.js';
 * 
 * // Отрисовка всей еды
 * renderFood();
 * 
 * // Функция автоматически:
 * // - Получает данные еды из game.food
 * // - Применяет смещение камеры
 * // - Рисует зеленые круги для каждого объекта еды
 */

import { game } from "./game"

/**
 * Отрисовывает всю еду на canvas
 * Рисует еду как зеленые круги
 */
export const renderFood = () => {
    const ctx = game.ctx;                   // Контекст для рисования
    const food = game.food;                 // Массив всей еды
    const offsetX = game.offsetX;           // Смещение камеры по X
    const offsetY = game.offsetY;           // Смещение камеры по Y

    // Отрисовываем каждый объект еды
    food.forEach((f) => {
        ctx.fillStyle = 'green';            // Зеленый цвет для еды
        ctx.beginPath();
        ctx.arc(f.x - offsetX, f.y - offsetY, f.size, 0, Math.PI * 2);
        ctx.fill();
    });
}