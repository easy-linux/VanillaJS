/**
 * @module Client/MouseControl
 * @category Client
 * @description Модуль управления игрой мышью
 * 
 * Этот модуль содержит:
 * - Отслеживание позиции мыши относительно canvas
 * - Вычисление направления движения к курсору
 * - Интервальную отправку команд движения на сервер
 * - Переключение между управлением клавиатурой и мышью
 * - Автоматическое включение/выключение при изменении checkbox
 * 
 * @example
 * import './mouseControl.js';
 * 
 * // Модуль автоматически подключается и:
 * // - Отслеживает движение мыши
 * // - Вычисляет направление к курсору
 * // - Отправляет команды движения каждые 100ms
 * // - Реагирует на checkbox для включения/выключения
 */

import { messageTypes } from "../constants";
import { game } from "./game";
import { sendMessage } from "./websocket";

// Координаты мыши относительно canvas
let mouseX = game.canvas.width / 2;        // X координата мыши
let mouseY = game.canvas.height / 2;       // Y координата мыши
let useMouse = true;                       // Флаг использования мыши
let intervalId = null;                     // ID интервала для отправки команд

/**
 * Обработчик движения мыши
 * Обновляет координаты мыши относительно canvas
 * @param {MouseEvent} e - событие движения мыши
 */
const onMouseMove = (e) => {
  const rect = game.canvas.getBoundingClientRect(); // Получаем позицию canvas
  mouseX = e.clientX - rect.left;                   // Вычисляем X относительно canvas
  mouseY = e.clientY - rect.top;                    // Вычисляем Y относительно canvas
};

/**
 * Привязывает обработчики событий мыши
 * Устанавливает интервал для отправки команд движения на сервер
 */
const bindMouseEvents = () => {
  window.removeEventListener("mousemove", onMouseMove); // Удаляем старый обработчик
  window.addEventListener("mousemove", onMouseMove);    // Добавляем новый обработчик
  
  // Очищаем старый интервал если есть
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  // Устанавливаем интервал для отправки команд движения
  intervalId = setInterval(() => {
    // Вычисляем смещение от центра canvas
    const dx = mouseX - game.canvas.width / 2;
    const dy = mouseY - game.canvas.height / 2;
    const dist = Math.sqrt(dx * dx + dy * dy); // Расстояние от центра

    let vx = 0;
    let vy = 0;
    const speed = 2; // Скорость движения

    // Двигаемся только если мышь достаточно далеко от центра
    if (dist > 10) {
      vx = (dx / dist) * speed; // Нормализуем и умножаем на скорость
      vy = (dy / dist) * speed;
    }

    // Отправляем команду движения на сервер
    sendMessage(
      JSON.stringify({
        type: messageTypes.MOVE,
        vx,
        vy,
      })
    );
  }, 100); // Обновляем каждые 100ms
};

/**
 * Отвязывает обработчики событий мыши
 * Очищает интервал отправки команд
 */
const unbindMouseEvents = () => {
  window.removeEventListener("mousemove", onMouseMove); // Удаляем обработчик
  if (intervalId) {
    clearInterval(intervalId); // Очищаем интервал
    intervalId = null;
  }
};

// Получаем элемент checkbox для переключения управления мышью
const mouseCheckbox = document.querySelector(".checkbox-mouse");

/**
 * Обработчик изменения состояния checkbox
 * Включает или выключает управление мышью
 */
mouseCheckbox.addEventListener("change", (e) => {
  useMouse = e.target.checked;
  if (useMouse) {
    bindMouseEvents();    // Включаем управление мышью
  } else {
    unbindMouseEvents();  // Выключаем управление мышью
  }
});

// Инициализация управления мышью при загрузке
if (useMouse) {
  bindMouseEvents();
} else {
  unbindMouseEvents();
}
