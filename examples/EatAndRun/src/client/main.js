/**
 * @module Client/Main
 * @category Client
 * @description Основной модуль клиентского приложения
 * 
 * Этот модуль содержит:
 * - Обработчики событий для пользовательского интерфейса
 * - Управление кнопкой старт/стоп игры
 * - Обработку модального окна завершения игры
 * - Функционал установки имени игрока
 * - Импорт всех необходимых модулей
 * 
 * @example
 * import './main.js';
 * 
 * // Модуль автоматически подключается и обрабатывает:
 * // - Клик по кнопке старт/стоп игры
 * // - Закрытие модального окна завершения игры
 * // - Установку имени игрока через форму
 * // - Интеграцию с game и websocket модулями
 */

import { messageTypes } from "../constants";
import "../style.css";
import { game } from "./game";
import { sendMessage } from "./websocket";
import "./keyboardControl"
import "./mouseControl"

// Получаем кнопку старт/стоп игры
const btn = document.querySelector(".start-button")

/**
 * Обработчик клика по кнопке старт/стоп
 * Переключает состояние игры между запущенной и остановленной
 */
btn.addEventListener("click", () => {
  if(btn.textContent === "Start Game") {
    game.start();                           // Запускаем игру
    btn.textContent = "Stop Game";          // Меняем текст кнопки
  } else {
    game.stop();                            // Останавливаем игру
    btn.textContent = "Start Game";         // Меняем текст кнопки
  }
});

/**
 * Обработчик клика по кнопке закрытия модального окна
 * Закрывает окно завершения игры и перезапускает игру
 */
document.querySelector(".close-button").addEventListener("click", () => {
  const modal = document.querySelector("#game-over-panel");
  const message = document.querySelector(".modal-message");
  
  // Скрываем модальное окно
  if (modal) {
    modal.style.display = "none";
  }
  
  // Очищаем сообщение
  if(message){
    message.textContent = "";
  }

});

/**
 * Обработчик клика по кнопке установки имени
 * Отправляет новое имя игрока на сервер
 */
document.querySelector(".set-name-button").addEventListener("click", () => {  
   const input  = document.querySelector(".imput-name");
   const name = input.value.trim();         // Получаем и очищаем имя от пробелов
   
   // Проверяем, что имя не пустое
   if(name.length > 0) {
     game.playerName = name;                // Устанавливаем имя в игре
     
     // Отправляем новое имя на сервер
     sendMessage(JSON.stringify({
       type: messageTypes.SET_NAME,
       name: game.playerName,
     }));
   }
});

