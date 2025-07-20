/**
 * @module Server/Food
 * @category Server
 * @description Модуль управления едой в игре
 * 
 * Этот модуль содержит:
 * - Создание и управление объектами еды
 * - Перезапуск системы еды
 * - Добавление новой еды при необходимости
 * - Обработку поедания еды игроками
 * - Интеграцию с пространственной сеткой
 * 
 * @example
 * import { getFood, restartFood, addFood, eatFood } from './food.js';
 * 
 * // Получение всех объектов еды
 * const food = getFood();
 * 
 * // Перезапуск системы еды
 * restartFood();
 * 
 * // Обработка поедания еды игроком
 * eatFood(player);
 */

import { INITIAL_FOOD_COUNT } from "../constants.js";
import { randomPos } from "./utils.js";
import { spatialGrid, getNearbyEntities } from "./spatialGrid.js";
import { toShortId } from "./shortId.js";

// Хранилище еды в виде Map для быстрого доступа по ID
const food = new Map();

/**
 * Возвращает все объекты еды в виде массива
 * @returns {Array} массив всех объектов еды
 */
export const getFood = () => {
  return Array.from(food.values());
};

/**
 * Перезапускает систему еды - очищает все существующие объекты и создает новые
 * Вызывается при инициализации игры и при перезапуске
 */
export const restartFood = () => {
  console.log('restartFood() вызван, очищаем', food.size, 'объектов еды');
  
  // Удаляем только объекты еды из пространственной сетки
  food.forEach(foodItem => {
    spatialGrid.removeEntity(foodItem);
  });
  food.clear(); // Очищаем Map с едой
  
  console.log('Добавляем', INITIAL_FOOD_COUNT, 'новых объектов еды');
  
  // Создаем начальные объекты еды
  for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
    const uuid = crypto.randomUUID();        // Генерируем полный UUID
    const shortId = toShortId(uuid);         // Создаем короткий ID для сети
    const foodItem = {
      id: shortId,                           // Используем короткий ID вместо UUID
      uuid: uuid,                            // Сохраняем UUID для внутреннего использования
      ...randomPos(),                        // Случайная позиция на карте
      size: 5,                               // Начальный размер еды
    };
    food.set(shortId, foodItem);             // Добавляем в Map
    spatialGrid.addEntity(foodItem);         // Добавляем в пространственную сетку
  }
  console.log('restartFood() завершен, количество еды:', food.size);
};

/**
 * Добавляет новую еду если её количество упало ниже 90% от начального
 * Поддерживает постоянное количество еды на карте
 */
export const addFood = () => {
  // Если еды меньше 90% от начального количества, добавляем недостающую
  if (food.size < INITIAL_FOOD_COUNT * 0.9) {
    const missingFoodCount = INITIAL_FOOD_COUNT - food.size;
    
    // Создаем недостающие объекты еды
    for (let i = 0; i < missingFoodCount; i++) {
      const uuid = crypto.randomUUID();      // Генерируем полный UUID
      const shortId = toShortId(uuid);       // Создаем короткий ID для сети
      const foodItem = {
        id: shortId,                         // Используем короткий ID вместо UUID
        uuid: uuid,                          // Сохраняем UUID для внутреннего использования
        ...randomPos(),                      // Случайная позиция на карте
        size: 5,                             // Размер еды
      };
      food.set(shortId, foodItem);           // Добавляем в Map
      spatialGrid.addEntity(foodItem);       // Добавляем в пространственную сетку
    }
  }
};

/**
 * Обрабатывает поедание еды игроком
 * Использует пространственную сетку для оптимизации поиска ближайшей еды
 * @param {Object} player - объект игрока, который ест еду
 */
export const eatFood = (player) => {
  // Используем пространственную сетку для получения только ближайших объектов
  const nearbyEntities = getNearbyEntities(player.x, player.y, 2);
  const eatenFood = []; // Список ID съеденной еды
  
  // Проверяем каждый ближайший объект
  nearbyEntities.forEach(entity => {
    if (food.has(entity.id)) { // Проверяем только объекты еды
      // Вычисляем расстояние до игрока
      const dx = entity.x - player.x;
      const dy = entity.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Если еда находится в пределах размера игрока, съедаем её
      if (distance < player.size) {
        player.size += 0.5;                  // Увеличиваем размер игрока
        eatenFood.push(entity.id);           // Добавляем в список съеденной еды
      }
    }
  });
  
  // Удаляем съеденную еду и добавляем новую
  eatenFood.forEach(id => {
    const oldFood = food.get(id);
    if (oldFood) {
      spatialGrid.removeEntity(oldFood);     // Удаляем из пространственной сетки
    }
    food.delete(id);                         // Удаляем из Map
    
    // Создаем новую еду на случайной позиции
    const uuid = crypto.randomUUID();        // Генерируем полный UUID
    const shortId = toShortId(uuid);         // Создаем короткий ID для сети
    const newFood = {
      id: shortId,                           // Используем короткий ID вместо UUID
      uuid: uuid,                            // Сохраняем UUID для внутреннего использования
      ...randomPos(),                        // Случайная позиция на карте
      size: 5,                               // Размер еды
    };
    food.set(shortId, newFood);              // Добавляем в Map
    spatialGrid.addEntity(newFood);          // Добавляем в пространственную сетку
  });
};
