/**
 * @module Server/Bots
 * @category Server
 * @description Модуль управления ботами (ИИ) в игре
 * 
 * Этот модуль содержит:
 * - Создание и управление ботами
 * - ИИ для поиска целей (игроков и еды)
 * - Логику движения ботов к целям
 * - Обработку игровой логики для ботов
 * - Создание снапшотов ботов для клиентов
 * - Перезапуск системы ботов
 * 
 * @example
 * import { getBots, createBot, getBotsSnapshot, restartBots } from './bots.js';
 * 
 * // Получение всех ботов
 * const bots = getBots();
 * 
 * // Создание нового бота
 * createBot();
 * 
 * // Создание снапшота для отправки клиентам
 * const snapshot = getBotsSnapshot();
 * 
 * // Перезапуск системы ботов
 * restartBots();
 */

import { BOT_COUNT, FIELD_SIZE } from "../constants.js";
import { explodeBomb } from "./bombs.js";
import { eatFood, getFood } from "./food.js";
import { getPlayers } from "./players.js";
import { getDistance, randomPos } from "./utils.js";
import { toShortId } from "./shortId.js";

// Хранилище ботов в виде Map для быстрого доступа по ID
const bots = new Map();

/**
 * Возвращает всех ботов в виде массива
 * @returns {Array} массив всех ботов
 */
export const getBots = () => {
  return Array.from(bots.values());
};

/**
 * Создает нового бота с случайной позицией и начальными параметрами
 * Бот получает короткий ID для сетевого взаимодействия
 */
export const createBot = () => {
  const uuid = crypto.randomUUID();          // Генерируем полный UUID
  const shortId = toShortId(uuid);           // Создаем короткий ID для сети
  const pos = randomPos();                   // Случайная начальная позиция
  const bot = {
    id: shortId,                             // Используем короткий ID для сети
    uuid: uuid,                              // Сохраняем UUID для внутреннего использования
    name: `Bot ${bots.size + 1}`,            // Имя бота
    x: pos.x,                                // X координата
    y: pos.y,                                // Y координата
    vx: 0,                                   // Скорость по X
    vy: 0,                                   // Скорость по Y
    size: 10,                                // Начальный размер
    isBot: true,                             // Флаг, что это бот
    changeDirCooldown: 0,                    // Кулдаун смены направления
  };
  bots.set(shortId, bot);
};

/**
 * Создает снапшот всех ботов с обновленным ИИ и логикой игры
 * Боты ищут цели (игроков меньше себя или еду), двигаются к ним и взаимодействуют с игровыми объектами
 * @returns {Array} массив снапшотов ботов для отправки клиентам
 */
export const getBotsSnapshot = () => {
  const snapshot = [];
  const bots = getBots();

  // Обрабатываем каждого бота
  bots.forEach((bot) => {
    let target = null;                       // Цель для движения
    let minDistance = Infinity;              // Минимальное расстояние до цели

    // Ищем игроков или ботов меньше себя для поедания
    for (const other of [...getPlayers(), ...getBots()]) {
      if (other.id === bot.id || other.size + 2 >= bot.size) continue; // Пропускаем себя и тех, кто больше

      const distance = getDistance(other, bot)

      if (distance < minDistance) {
        minDistance = distance;
        target = other;
      }
    }

    // Если не нашли цель для поедания, ищем ближайшую еду
    if (!target) {
      const food = getFood();
      food.forEach((f) => {
        const distance = getDistance(f, bot);
        if (distance < minDistance) {
          minDistance = distance;
          target = f;
        }
      });
    }

    // Двигаемся к цели
    if (target) {
      const distance = getDistance(target, bot);
      const speed = 1.5;                     // Скорость движения бота
      const dx = target.x - bot.x;           // Разность по X
      const dy = target.y - bot.y;           // Разность по Y
      bot.vx = (dx / distance) * speed;      // Вычисляем скорость по X
      bot.vy = (dy / distance) * speed;      // Вычисляем скорость по Y
    }

    // Обновляем позицию на основе скорости
    bot.x += bot.vx;
    bot.y += bot.vy;

    // Обрабатываем выход за границы поля (телепортация на противоположную сторону)
    if (bot.x < 0) bot.x = FIELD_SIZE;
    if (bot.x > FIELD_SIZE) bot.x = 0;
    if (bot.y < 0) bot.y = FIELD_SIZE;
    if (bot.y > FIELD_SIZE) bot.y = 0;

    // Обрабатываем взаимодействие с игровыми объектами
    eatFood(bot);      // Поедание еды
    explodeBomb(bot);  // Взрывы бомб

    // Проверяем столкновения с другими игроками и ботами
    for (const other of [...getPlayers(), ...getBots()]) {
      if (other.id === bot.id) continue; // Пропускаем самого себя

      const distance = getDistance(other, bot);
      // Если бот больше другого на 2 единицы, съедает его
      if (distance < bot.size && bot.size > other.size + 2) {
        bot.size += other.size * 0.5; // Увеличиваем размер на 50% от размера съеденного
        other.size = 10;               // Сбрасываем размер съеденного до минимума
        const pos = randomPos();       // Телепортируем съеденного на случайную позицию
        other.x = pos.x;
        other.y = pos.y;
      }
    }
    
    // Создаем снапшот бота для отправки клиентам
    snapshot.push({
      id: bot.id,
      x: bot.x,
      y: bot.y,
      size: bot.size,
      name: bot.name,
      isBot: bot.isBot,
    });
  });
  return snapshot;
};

/**
 * Перезапускает систему ботов - очищает всех существующих и создает новых
 * Вызывается при инициализации игры и при перезапуске
 */
export const restartBots = () => {
  bots.clear(); // Очищаем всех ботов
  
  // Создаем новое количество ботов согласно константе
  for(let i = 0; i < BOT_COUNT; i++){
    createBot()
  }
};
