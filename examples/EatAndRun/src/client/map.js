/**
 * @module Client/RenderMap
 * @category Client
 * @description Модуль рендеринга мини-карты
 * 
 * Этот модуль содержит:
 * - Функцию renderMap для отрисовки мини-карты
 * - Отображение позиций игроков и бомб в масштабированном виде
 * - Визуальное выделение текущего игрока зеленым цветом
 * - Размещение мини-карты в правом нижнем углу canvas
 * 
 * @example
 * import { renderMap } from './map.js';
 * 
 * // Отрисовка мини-карты
 * renderMap();
 * 
 * // Функция автоматически:
 * // - Создает фон мини-карты в правом нижнем углу
 * // - Масштабирует позиции игроков и бомб
 * // - Выделяет текущего игрока зеленым цветом
 * // - Показывает бомбы красными квадратиками
 */

import { FIELD_SIZE, MAP_SIZE } from "../constants";
import { game } from "./game"

/**
 * Отрисовывает мини-карту в правом нижнем углу
 * Показывает позиции всех игроков и бомб в масштабированном виде
 */
export const renderMap = () => {
    const ctx = game.ctx;                   // Контекст для рисования
    const canvas = game.canvas;             // Canvas элемент

    const currPlayerId = game.playerId;     // ID текущего игрока
    const players = game.players;           // Массив всех игроков
    const bombs = game.bombs;               // Массив всех бомб

    // Позиция мини-карты в правом нижнем углу
    const mapX = canvas.width - MAP_SIZE - 10;
    const mapY = canvas.height - MAP_SIZE - 10;
    
    // Рисуем фон мини-карты
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(mapX, mapY, MAP_SIZE, MAP_SIZE);

    // Отрисовываем игроков на мини-карте
    players.forEach((player) => {
        // Вычисляем позицию точки на мини-карте
        const dotX = mapX + (player.x / FIELD_SIZE) * MAP_SIZE;
        const dotY = mapY + (player.y / FIELD_SIZE) * MAP_SIZE;
        
        // Выбираем цвет: зеленый для текущего игрока, желтый для остальных
        ctx.fillStyle = player.id === currPlayerId ? 'green' : 'yellow';
        const size = player.id === currPlayerId ? 4 : 3; // Размер точки
        ctx.beginPath();
        ctx.arc(dotX + size / 2, dotY + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Отрисовываем бомбы на мини-карте
    bombs.forEach((bomb) => {
        // Вычисляем позицию точки на мини-карте
        const dotX = mapX + (bomb.x / FIELD_SIZE) * MAP_SIZE;
        const dotY = mapY + (bomb.y / FIELD_SIZE) * MAP_SIZE;
        
        // Рисуем красные квадратики для бомб
        ctx.fillStyle = 'red';
        ctx.fillRect(dotX, dotY, 3, 3);
    });
}