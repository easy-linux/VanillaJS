/**
 * @module Client/RenderPlayers
 * @category Client
 * @description Модуль рендеринга игроков на canvas
 * 
 * Этот модуль содержит:
 * - Функцию renderPlayers для отрисовки всех игроков
 * - Визуальное выделение текущего игрока синим цветом
 * - Отрисовку имен игроков над их кругами
 * - Интеграцию с системой камеры для центрирования
 * 
 * @example
 * import { renderPlayers } from './players.js';
 * 
 * // Отрисовка всех игроков
 * renderPlayers();
 * 
 * // Функция автоматически:
 * // - Получает данные игроков из game.players
 * // - Применяет смещение камеры
 * // - Рисует круги и имена игроков
 * // - Выделяет текущего игрока синим цветом
 */

import { game } from "./game"

/**
 * Отрисовывает всех игроков на canvas
 * Рисует игроков как круги с именами, выделяя текущего игрока синим цветом
 */
export const renderPlayers = () => {
    const ctx = game.ctx;                   // Контекст для рисования
    const currPlayerId = game.playerId;     // ID текущего игрока

    const players = game.players;           // Массив всех игроков
    const offsetX = game.offsetX;           // Смещение камеры по X
    const offsetY = game.offsetY;           // Смещение камеры по Y

    // Отрисовываем каждого игрока
    players.forEach((p) => {
       // Выбираем цвет: синий для текущего игрока, красный для остальных
       ctx.fillStyle = p.id === currPlayerId ? "blue" : "red";
       
       // Рисуем круг игрока
       ctx.beginPath();
       ctx.arc(p.x - offsetX, p.y - offsetY, p.size, 0, Math.PI * 2);
       ctx.fill();

       // Рисуем имя игрока над кругом
       ctx.fillStyle = p.id === currPlayerId ? "blue" : "red";
       ctx.font  = '12px Arial';
       ctx.textAlign = 'center';
       ctx.fillText(p.name, p.x - offsetX, p.y - offsetY - p.size - 5 );
    })
}