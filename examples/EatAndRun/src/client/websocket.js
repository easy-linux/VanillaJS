/**
 * @module Client/WebSocket
 * @category Client
 * @description Модуль WebSocket соединения для клиента
 * 
 * Этот модуль содержит:
 * - Инициализацию WebSocket соединения с сервером
 * - Обработку различных типов сообщений от сервера
 * - Декомпрессию входящих сообщений
 * - Отправку команд на сервер
 * - Управление жизненным циклом соединения
 * 
 * @example
 * import { initWS, sendMessage, closeWS } from './websocket.js';
 * 
 * // Инициализация соединения
 * initWS({
 *   playerName: 'Player1',
 *   onInit: (id) => console.log('Player ID:', id),
 *   onUpdate: (msg) => handleGameUpdate(msg),
 *   onClose: () => console.log('Connection closed')
 * });
 * 
 * // Отправка команды движения
 * sendMessage(JSON.stringify({ type: 'move', vx: 2, vy: 0 }));
 * 
 * // Закрытие соединения
 * closeWS();
 */

import { messageTypes } from "../constants";
import { decompressMessage } from "../compression.js";  

// Уникальный ID пользователя для идентификации соединения
const userId = crypto.randomUUID();
// Глобальная переменная WebSocket соединения
let ws;

/**
 * Инициализирует WebSocket соединение с сервером
 * Настраивает обработчики событий и отправляет начальные данные
 * @param {Object} options - объект с настройками и колбэками
 * @param {string} options.playerName - имя игрока
 * @param {Function} options.onInit - колбэк инициализации
 * @param {Function} options.onUpdate - колбэк обновления игры
 * @param {Function} options.onClose - колбэк закрытия соединения
 * @param {Function} options.onGameOver - колбэк завершения игры
 * @param {Function} options.onGameRestart - колбэк перезапуска игры
 */
export const initWS = ({ playerName, onInit, onUpdate, onClose, onGameOver, onGameRestart }) => {
  // Определяем протокол WebSocket в зависимости от протокола страницы
  const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  ws = new window.WebSocket(`${wsProtocol}${window.location.host}/ws?id=${userId}`);
  //ws = new WebSocket(`${wsProtocol}localhost:3001/ws?id=${userId}`);

  // Обработчик открытия соединения
  ws.addEventListener("open", () => {
    // Отправляем имя игрока на сервер
    ws.send(JSON.stringify({ type: messageTypes.SET_NAME, name: playerName }));
  });

  // Обработчик входящих сообщений
  ws.addEventListener("message", (event) => {
    const compressedMsg = JSON.parse(event.data);  // Парсим сжатое сообщение
    const msg = decompressMessage(compressedMsg);  // Декомпрессируем сообщение

    // Обрабатываем различные типы сообщений
    switch (msg.type) {
      case messageTypes.INIT:
        // Инициализация игрока - получение ID
        if (onInit) {
          onInit(msg.id);
        }
        break;
      case messageTypes.GAME_UPDATE:
        // Обновление состояния игры
        if (onUpdate) {
          onUpdate(msg);
        }
        break;
      case messageTypes.GAME_OVER:
        // Завершение игры
        if (onGameOver) {
          onGameOver(msg);
        }
        break;
      case messageTypes.GAME_RESTARTED:
        // Обрабатываем перезапуск игры - очищаем состояние и ждем новых обновлений
        console.log('Игра перезапущена сервером');
        if (onGameRestart) {
          onGameRestart();
        }
        break;
      default:
        console.warn('Неизвестный тип сообщения:', msg.type);
        break;
    }
  });

  // Обработчик закрытия соединения
  ws.addEventListener("close", () => {
    if (onClose) {
      onClose();
    }
  });
};

/**
 * Отправляет сообщение на сервер
 * Проверяет состояние соединения перед отправкой
 * @param {Object|string} message - сообщение для отправки
 */
export const sendMessage = (message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    console.warn("WebSocket не открыт. Сообщение не отправлено:", message);
  }
};

/**
 * Закрывает WebSocket соединение
 * Очищает глобальную переменную соединения
 */
export const closeWS = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};
