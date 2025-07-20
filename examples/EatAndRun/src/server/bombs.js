/**
 * @module Server/Bombs
 * @category Server
 * @description Модуль управления бомбами в игре
 * 
 * Этот модуль содержит:
 * - Создание и управление объектами бомб
 * - Перезапуск системы бомб
 * - Добавление новых бомб при необходимости
 * - Обработку взрывов бомб при столкновении с игроками
 * - Интеграцию с пространственной сеткой
 * 
 * @example
 * import { getBombs, restartBombs, addBomb, explodeBomb } from './bombs.js';
 * 
 * // Получение всех бомб
 * const bombs = getBombs();
 * 
 * // Перезапуск системы бомб
 * restartBombs();
 * 
 * // Обработка взрыва бомбы при столкновении с игроком
 * explodeBomb(player);
 */

import { INITIAL_BOMBS_COUNT } from "../constants.js";
import { randomPos } from "./utils.js";
import { spatialGrid, getNearbyEntities } from "./spatialGrid.js";
import { toShortId } from "./shortId.js";

// Хранилище бомб в виде Map для быстрого доступа по ID
const bombs = new Map();

/**
 * Возвращает все объекты бомб в виде массива
 * @returns {Array} массив всех объектов бомб
 */
export const getBombs = () => {
  return Array.from(bombs.values());
};

/**
 * Перезапускает систему бомб - очищает все существующие объекты и создает новые
 * Вызывается при инициализации игры и при перезапуске
 */
export const restartBombs = () => {
  console.log('restartBombs() вызван, очищаем', bombs.size, 'бомб');
  
  // Сначала удаляем все бомбы из пространственной сетки
  bombs.forEach(bomb => {
    spatialGrid.removeEntity(bomb);
  });
  bombs.clear(); // Очищаем Map с бомбами
  
  console.log('Добавляем', INITIAL_BOMBS_COUNT, 'новых бомб');
  
  // Создаем начальные объекты бомб
  for (let i = 0; i < INITIAL_BOMBS_COUNT; i++) {
    const uuid = crypto.randomUUID();        // Генерируем полный UUID
    const shortId = toShortId(uuid);         // Создаем короткий ID для сети
    const bomb = {
      id: shortId,                           // Используем короткий ID вместо UUID
      uuid: uuid,                            // Сохраняем UUID для внутреннего использования
      ...randomPos(),                        // Случайная позиция на карте
      size: 5,                               // Начальный размер бомб
    };
    bombs.set(shortId, bomb);                // Добавляем в Map
    spatialGrid.addEntity(bomb);             // Добавляем в пространственную сетку
  }
  console.log('restartBombs() завершен, количество бомб:', bombs.size);
};

/**
 * Добавляет новые бомбы если их количество упало ниже 90% от начального
 * Поддерживает постоянное количество бомб на карте
 */
export const addBomb = () => {
  // Если бомб меньше 90% от начального количества, добавляем недостающие
  if (bombs.size < INITIAL_BOMBS_COUNT * 0.9) {
    const missingBombsCount = INITIAL_BOMBS_COUNT - bombs.size;
    
    // Создаем недостающие объекты бомб
    for (let i = 0; i < missingBombsCount; i++) {
      const uuid = crypto.randomUUID();      // Генерируем полный UUID
      const shortId = toShortId(uuid);       // Создаем короткий ID для сети
      const bomb = {
        id: shortId,                         // Используем короткий ID вместо UUID
        uuid: uuid,                          // Сохраняем UUID для внутреннего использования
        ...randomPos(),                      // Случайная позиция на карте
        size: 5,                             // Размер бомбы
      };
      bombs.set(shortId, bomb);              // Добавляем в Map
      spatialGrid.addEntity(bomb);           // Добавляем в пространственную сетку
    }
  }
};

/**
 * Обрабатывает взрыв бомбы при столкновении с игроком
 * Использует пространственную сетку для оптимизации поиска ближайших бомб
 * @param {Object} player - объект игрока, который столкнулся с бомбой
 */
export const explodeBomb = (player) => {
  // Используем пространственную сетку для получения только ближайших объектов
  const nearbyEntities = getNearbyEntities(player.x, player.y, 2);
  const explodedBombs = []; // Список ID взорвавшихся бомб
  
  // Проверяем каждый ближайший объект
  nearbyEntities.forEach(entity => {
    if (bombs.has(entity.id)) { // Проверяем только объекты бомб
      // Вычисляем расстояние до игрока
      const dx = entity.x - player.x;
      const dy = entity.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Если бомба находится в пределах размера игрока, взрываем её
      if (distance < player.size) {
        // Уменьшаем размер игрока в 2 раза, но не меньше 10
        player.size = Math.max(10, player.size * 0.5);  
        explodedBombs.push(entity.id);       // Добавляем в список взорвавшихся бомб
      }
    }
  });
  
  // Удаляем взорвавшиеся бомбы и добавляем новые
  explodedBombs.forEach(id => {
    const oldBomb = bombs.get(id);
    if (oldBomb) {
      spatialGrid.removeEntity(oldBomb);     // Удаляем из пространственной сетки
    }
    bombs.delete(id);                        // Удаляем из Map
    
    // Создаем новую бомбу на случайной позиции
    const uuid = crypto.randomUUID();        // Генерируем полный UUID
    const shortId = toShortId(uuid);         // Создаем короткий ID для сети
    const newBomb = {
      id: shortId,                           // Используем короткий ID вместо UUID
      uuid: uuid,                            // Сохраняем UUID для внутреннего использования
      ...randomPos(),                        // Случайная позиция на карте
      size: 5,                               // Размер бомбы
    };
    bombs.set(shortId, newBomb);             // Добавляем в Map
    spatialGrid.addEntity(newBomb);          // Добавляем в пространственную сетку
  });
};
