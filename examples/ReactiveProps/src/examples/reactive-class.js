// Класс для управления реактивными значениями
class Reactive {
  constructor(initialValue) {
    this._value = initialValue;
    this._subscribers = [];
    this._history = [initialValue];
  }

  // Геттер для получения значения
  get value() {
    return this._value;
  }

  // Сеттер для установки значения
  set value(newValue) {
    if (this._value !== newValue) {
      const oldValue = this._value;
      this._value = newValue;
      this._history.push(newValue);
      // Ограничиваем историю последними 10 значениями
      if (this._history.length > 10) {
        this._history.shift();
      }
      this._notify(oldValue);
    }
  }

  // Метод для подписки на изменения
  subscribe(callback) {
    this._subscribers.push(callback);
    // Возвращаем функцию для отписки
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  // Метод для уведомления всех подписчиков
  _notify(oldValue) {
    this._subscribers.forEach(callback => {
      try {
        callback(this._value, oldValue);
      } catch (error) {
        console.error('Ошибка в подписчике:', error);
      }
    });
  }

  // Геттер для получения истории
  get history() {
    return [...this._history];
  }

  // Геттер для количества подписчиков
  get subscriberCount() {
    debugger
    return this._subscribers.length;
  }
}

// Создаем реактивный счетчик
const counter = new Reactive(0);
let unsubscribeFunctions = [];

// Функции для демонстрации
function log(message) {
  const logElement = document.getElementById('log');
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-message">${message}</span>`;
  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
}

function updateDisplay() {
  document.getElementById('currentValue').textContent = counter.value;
  document.getElementById('subscriberCount').textContent = counter.subscriberCount;
  document.getElementById('history').textContent = JSON.stringify(counter.history);
}

function incrementCounter() {
  counter.value = counter.value + 1;
  document.getElementById('counterInput').value = counter.value;
}

function decrementCounter() {
  counter.value = counter.value - 1;
  document.getElementById('counterInput').value = counter.value;
}

function addSubscriber() {
  const subscriberId = counter.subscriberCount + 1;
  const unsubscribe = counter.subscribe((newValue, oldValue) => {
    log(`Подписчик ${subscriberId}: ${oldValue} → ${newValue}`);
    updateDisplay();
  });
  unsubscribeFunctions.push(unsubscribe);
  log(`Добавлен подписчик ${subscriberId}`);
  updateDisplay();
}

function removeLastSubscriber() {
  if (unsubscribeFunctions.length > 0) {
    const unsubscribe = unsubscribeFunctions.pop();
    unsubscribe();
    log(`Удален последний подписчик`);
    updateDisplay();
  } else {
    log(`Нет подписчиков для удаления`);
  }
}

function clearLog() {
  document.getElementById('log').innerHTML = '';
}

// Инициализация
document.getElementById('counterInput').addEventListener('input', (e) => {
  counter.value = parseInt(e.target.value) || 0;
});

// Event listeners для кнопок
document.querySelector('.increment-counter').addEventListener('click', incrementCounter);
document.querySelector('.decrement-counter').addEventListener('click', decrementCounter);
document.querySelector('.add-subscriber').addEventListener('click', addSubscriber);
document.querySelector('.remove-last-subscriber').addEventListener('click', removeLastSubscriber);
document.querySelector('.clear-log').addEventListener('click', clearLog);

// Добавляем первый подписчик для демонстрации
counter.subscribe((newValue, oldValue) => {
  log(`Основной подписчик: ${oldValue} → ${newValue}`);
  updateDisplay();
});

// Динамическая загрузка кода
import code from './reactive-class.js?raw';
document.querySelector('#codeDisplay').textContent = code;

updateDisplay();
log('Система Reactive класса инициализирована'); 