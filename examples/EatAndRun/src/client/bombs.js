/**
 * @module Client/RenderBombs
 * @category Client
 * @description Модуль рендеринга бомб на canvas
 * 
 * Этот модуль содержит:
 * - Функцию renderBombs для отрисовки всех бомб
 * - Отрисовку бомб как черных кругов с желтой обводкой
 * - Интеграцию с системой камеры для центрирования
 * - Получение данных бомб из game.bombs
 * 
 * @example
 * import { renderBombs } from './bombs.js';
 * 
 * // Отрисовка всех бомб
 * renderBombs();
 * 
 * // Функция автоматически:
 * // - Получает данные бомб из game.bombs
 * // - Применяет смещение камеры
 * // - Рисует черные круги с желтой обводкой для каждой бомбы
 */

import { game } from "./game"

/**
 * Отрисовывает все бомбы на canvas
 * Рисует бомбы как черные круги с желтой обводкой
 */
export const renderBombs = () => {
    const ctx = game.ctx;                   // Контекст для рисования
    const bombs = game.bombs;               // Массив всех бомб
    const offsetX = game.offsetX;           // Смещение камеры по X
    const offsetY = game.offsetY;           // Смещение камеры по Y

    // Отрисовываем каждую бомбу
    bombs.forEach((f) => {
        // Рисуем черный круг бомбы
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(f.x - offsetX, f.y - offsetY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавляем желтую обводку для выделения
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}