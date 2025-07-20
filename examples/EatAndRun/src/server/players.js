/**
 * @module Server/Players
 * @category Server
 * @description Модуль управления игроками на сервере
 * 
 * Этот модуль содержит:
 * - Добавление и управление игроками
 * - Обработку WebSocket соединений
 * - Валидацию входящих сообщений
 * - Создание снапшотов игроков
 * - Обработку игровой логики (движение, столкновения, поедание)
 * - Отправку сообщений всем игрокам
 * 
 * @example
 * import { addPlayer, getPlayers, getPlayersSnapshot, broadcastMessage } from './players.js';
 * 
 * // Добавление нового игрока
 * addPlayer(playerId, websocket);
 * 
 * // Получение всех игроков
 * const players = getPlayers();
 * 
 * // Создание снапшота для отправки клиентам
 * const snapshot = getPlayersSnapshot();
 * 
 * // Отправка сообщения всем игрокам
 * broadcastMessage(message);
 */

import { FIELD_SIZE, MAX_PLAYER_COUNT, messageTypes } from "../constants.js";
import { explodeBomb } from "./bombs.js";
import { getBots } from "./bots.js";
import { eatFood } from "./food.js";
import { getDistance, randomPos } from "./utils.js";
import { compressMessage } from "../compression.js";
import { performanceMonitor } from "./performance.js";
import { getFood } from "./food.js";
import { getBombs } from "./bombs.js";
import { getBotsSnapshot } from "./bots.js";
import { toShortId } from "./shortId.js";

// Хранилище игроков в виде Map для быстрого доступа по ID
const players = new Map();

/**
 * Добавляет нового игрока в игру
 * Создает объект игрока, настраивает WebSocket обработчики и отправляет начальное состояние
 * @param {string} id - UUID игрока
 * @param {WebSocket} ws - WebSocket соединение игрока
 */
export const addPlayer = (id, ws) => {
  // Проверяем лимит игроков
  if(players.size > MAX_PLAYER_COUNT){
    ws.close(1000, 'слишком много игроков');
    return 
  }
  
  // Создаем объект игрока
  const pos = randomPos();                    // Случайная начальная позиция
  const shortId = toShortId(id);              // Создаем короткий ID для сети
  const player = {
    id: shortId,                              // Используем короткий ID для сети
    uuid: id,                                 // Сохраняем оригинальный UUID для внутреннего использования
    ws,                                       // WebSocket соединение
    x: pos.x,                                 // X координата
    y: pos.y,                                 // Y координата
    vx: 0,                                    // Скорость по X
    vy: 0,                                    // Скорость по Y
    size: 10,                                 // Начальный размер
    name: `Player ${shortId}`,                 // Имя игрока
  };
  players.set(shortId, player);
  
  // Отправляем игроку его ID
  ws.send(JSON.stringify(compressMessage({ type: messageTypes.INIT, id: shortId })));
  
  // Отправляем начальное состояние игры
  const playersSnapshot = getPlayersSnapshot();
  const botsSnapshot = getBotsSnapshot();
  const food = getFood();
  const bombs = getBombs();
  
  const initialUpdate = {
    type: messageTypes.GAME_UPDATE,
    players: [...playersSnapshot, ...botsSnapshot],
    food: food,
    bombs: bombs,
    leaderBoard: []
  };
  
  const compressedMessage = compressMessage(initialUpdate);
  const messageString = JSON.stringify(compressedMessage);
  ws.send(messageString);

  // Настраиваем обработчик входящих сообщений от игрока
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case messageTypes.MOVE:
        // Проверяем скорость движения на античит
        if(data.vx > 10 || data.vy > 10){
          console.warn(`Игрок ${shortId} пытался двигаться слишком быстро: vx=${data.vx}, vy=${data.vy}`);
          ws.close(1000, 'слишком быстро');
          return;
        }
        player.vx = data.vx;
        player.vy = data.vy;
        break;
      case messageTypes.SET_NAME:
        // Валидация имени игрока
        if (typeof data.name !== "string" || data.name.length < 3 || data.name.length > 20 || `${data.name}`.toUpperCase().indexOf("BOT") !== -1) {
          console.warn(`Игрок ${shortId} пытался установить недопустимое имя: ${data.name}`);
          ws.close(1000, 'недопустимое имя');
          return;
        }
        player.name = `Player ${data.name}`;
        break;
      default:
        console.warn(`Неизвестный тип сообщения: ${data.type}`);
    }
  });

  // Обработчик отключения игрока
  ws.on("close", () => {
    players.delete(shortId);
  });
};

/**
 * Возвращает всех игроков в виде массива
 * @returns {Array} массив всех игроков
 */
export const getPlayers = () => {
  return Array.from(players.values());
};

/**
 * Очищает всех игроков (при перезапуске игры)
 */
export const restartPlayers = () => {
  players.clear();
};

/**
 * Создает снапшот всех игроков с обновленными позициями и логикой игры
 * Обрабатывает движение, столкновения, поедание еды и взрывы бомб
 * @returns {Array} массив снапшотов игроков для отправки клиентам
 */
export const getPlayersSnapshot = () => {
  const snapshot = [];
  const players = getPlayers();
  const bots = getBots()
  
  // Обрабатываем каждого игрока
  players.forEach((player) => {
    // Обновляем позицию на основе скорости
    player.x += player.vx;
    player.y += player.vy;

    // Обрабатываем выход за границы поля (телепортация на противоположную сторону)
    if (player.x < 0) player.x = FIELD_SIZE;
    if (player.x > FIELD_SIZE) player.x = 0;
    if (player.y < 0) player.y = FIELD_SIZE;
    if (player.y > FIELD_SIZE) player.y = 0;

    // Обрабатываем взаимодействие с игровыми объектами
    eatFood(player);      // Поедание еды
    explodeBomb(player);  // Взрывы бомб

    // Проверяем столкновения с другими игроками и ботами
    for (const other of [...players, ...bots]) {
      if (other.id === player.id) continue; // Пропускаем самого себя

      const distance = getDistance(other, player);
      // Если игрок больше другого на 2 единицы, съедает его
      if (distance < player.size && player.size > other.size + 2) {
        player.size += other.size * 0.5; // Увеличиваем размер на 50% от размера съеденного
        other.size = 10;                  // Сбрасываем размер съеденного до минимума
        const pos = randomPos();          // Телепортируем съеденного на случайную позицию
        other.x = pos.x;
        other.y = pos.y;
      }
    }

    // Создаем снапшот игрока для отправки клиентам
    snapshot.push({
      id: player.id,
      x: player.x,
      y: player.y,
      size: player.size,
      name: player.name,
    });
  });
  return snapshot;
};

/**
 * Отправляет сообщение всем подключенным игрокам
 * Сжимает сообщение и записывает метрики производительности
 * @param {Object} message - сообщение для отправки
 */
export const broadcastMessage = (message) => {
  const players = getPlayers();
  const compressedMessage = compressMessage(message);
  const messageString = JSON.stringify(compressedMessage);
  
  // Записываем метрики производительности
  performanceMonitor.recordMessage(message, compressedMessage);
  performanceMonitor.recordUpdate();
  
  // Логируем отправку важных сообщений
  if (message.type === messageTypes.GAME_RESTARTED) {
    console.log(`Отправляем сообщение о перезапуске игры ${players.length} игрокам`);
  }
  
  // Отправляем сообщение всем активным игрокам
  players.forEach((player) => {
    if (player.ws.readyState === player.ws.OPEN) {
      player.ws.send(messageString);
    }
  });
};

/**
 * Отправляет сообщение о завершении игры всем игрокам
 * @param {string} message - текст сообщения о завершении игры
 */
export const broadcastGameOver = (message) => {
  console.log('Отправляем сообщение о завершении игры:', message);
  const payload = {
    type: messageTypes.GAME_OVER,
    message: message,
  };
  broadcastMessage(payload);
};
