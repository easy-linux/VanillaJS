/**
 * @module Server/Utils
 * @category Server
 * @description Модуль утилитарных функций для сервера
 * 
 * Этот модуль содержит:
 * - Генерацию случайных позиций на игровом поле
 * - Вычисление расстояния между точками
 * - Общие математические функции для игры
 * 
 * @example
 * import { randomPos, getDistance } from './utils.js';
 * 
 * // Генерация случайной позиции
 * const position = randomPos();
 * 
 * // Вычисление расстояния между объектами
 * const distance = getDistance(obj1, obj2);
 */

import { FIELD_SIZE } from "../constants.js";

/**
 * Генерирует случайную позицию в пределах игрового поля
 * @returns {Object} объект с координатами {x, y}
 */
export const randomPos = () => {
  return {
    x: Math.floor(Math.random() * FIELD_SIZE), // Случайная X координата
    y: Math.floor(Math.random() * FIELD_SIZE), // Случайная Y координата
  };
};

/**
 * Вычисляет евклидово расстояние между двумя точками
 * Используется для определения столкновений и поиска ближайших объектов
 * @param {Object} a - первая точка с координатами {x, y}
 * @param {Object} b - вторая точка с координатами {x, y}
 * @returns {number} расстояние между точками
 */
export const getDistance = (a, b) => {
  const dx = a.x - b.x; // Разность по X
  const dy = a.y - b.y; // Разность по Y
  return Math.sqrt(dx * dx + dy * dy); // Евклидово расстояние
};
