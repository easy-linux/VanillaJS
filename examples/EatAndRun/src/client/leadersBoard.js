/**
 * @module Client/RenderLeadersBoard
 * @category Client
 * @description Модуль рендеринга таблицы лидеров
 * 
 * Этот модуль содержит:
 * - Функцию renderLeadersBoard для отрисовки таблицы лидеров
 * - Отображение топ-10 игроков по размеру
 * - Размещение таблицы в левом верхнем углу canvas
 * - Полупрозрачный фон для лучшей читаемости
 * 
 * @example
 * import { renderLeadersBoard } from './leadersBoard.js';
 * 
 * // Отрисовка таблицы лидеров
 * renderLeadersBoard();
 * 
 * // Функция автоматически:
 * // - Создает полупрозрачный фон в левом верхнем углу
 * // - Отображает заголовок "ТОП 10"
 * // - Показывает список игроков с их размерами
 * // - Получает данные из game.leaderBoard
 */

import { game } from "./game"

/**
 * Отрисовывает таблицу лидеров в левом верхнем углу
 * Показывает топ-10 игроков по размеру
 */
export const renderLeadersBoard = () => {
    const ctx = game.ctx;                   // Контекст для рисования
    const leaderBoard = game.leaderBoard;   // Массив лидеров
    
    // Рисуем фон таблицы лидеров
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 200, (1 + leaderBoard.length) * 23);
    
    // Рисуем заголовок таблицы
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ТОП 10', 100, 30);
    
    // Рисуем список игроков
    ctx.textAlign = 'left';
    leaderBoard.forEach((l, i) => {
        ctx.fillText(`${i+1}. ${l.name} (${l.size})`, 20, 50 + i * 20)
    })
}