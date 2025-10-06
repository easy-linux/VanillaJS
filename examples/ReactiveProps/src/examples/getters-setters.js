// Создаем реактивный объект
let reactiveObj = {};
let _value = 'Hello';
let listeners = [];
let subscriberId = 0;
let subscribers = [];

// Определяем реактивное свойство
Object.defineProperty(reactiveObj, 'value', {
  get() {
    return _value;
  }, 
  set(newValue) {
    _value = newValue;
    // Уведомляем всех подписчиков
    listeners.forEach(listener => listener(newValue));
  }
});

// Метод для подписки на изменения
reactiveObj.subscribe = (callback) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

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
  document.getElementById('display').textContent = reactiveObj.value;
  updateSubscriberList();
}

function updateSubscriberList() {
  const subscriberListElement = document.getElementById('subscriberList');

  if (subscribers.length === 0) {
    subscriberListElement.innerHTML = '<div style="color: #666; font-style: italic;">Нет подписчиков</div>';
    return;
  }
  subscriberListElement.innerHTML = '';

  subscribers.map(subscriber => {
    const item = document.createElement('div');
    item.className = 'subscriber-item';
    item.innerHTML = `
    <div class="subscriber-info">
      <div class="subscriber-id">Подписчик ${subscriber.id}</div>
      <div class="subscriber-value">Последнее значение: ${subscriber.lastValue}</div>
    </div>
  `;
    const button = document.createElement('button');
    button.className = 'remove-subscriber';
    button.textContent = 'Удалить';
    button.addEventListener('click', () => removeSubscriber(subscriber.id));
    item.appendChild(button);
    subscriberListElement.appendChild(item);
  });

}

function updateValue() {
  const input = document.getElementById('valueInput');
  reactiveObj.value = input.value;
}

function addSubscriber() {
  subscriberId++;
  const currentId = subscriberId;

  const unsubscribe = reactiveObj.subscribe((value) => {
    // Обновляем последнее значение подписчика
    const subscriber = subscribers.find(s => s.id === currentId);
    if (subscriber) {
      subscriber.lastValue = value;
      updateSubscriberList();
    }
    log(`Подписчик ${currentId}: значение изменилось на ${value}`);
  });

  // Добавляем подписчика в список
  subscribers.push({
    id: currentId,
    lastValue: reactiveObj.value,
    unsubscribe: unsubscribe
  });

  log(`Добавлен подписчик ${currentId}`);
  updateDisplay();
}

function removeSubscriber(id) {
  const subscriberIndex = subscribers.findIndex(s => s.id === id);
  if (subscriberIndex !== -1) {
    const subscriber = subscribers[subscriberIndex];
    subscriber.unsubscribe(); // Отписываемся
    subscribers.splice(subscriberIndex, 1); // Удаляем из списка
    log(`Удален подписчик ${id}`);
    updateDisplay();
  }
}

// Инициализация
document.getElementById('valueInput').addEventListener('input', (e) => {
  reactiveObj.value = e.target.value;
});

// Подписываемся на изменения для обновления отображения
reactiveObj.subscribe(() => {
  updateDisplay();
});

// Добавляем первый подписчик для демонстрации
subscriberId++;
const mainSubscriberId = subscriberId;
const mainUnsubscribe = reactiveObj.subscribe((value) => {
  // Обновляем последнее значение основного подписчика
  const subscriber = subscribers.find(s => s.id === mainSubscriberId);
  if (subscriber) {
    subscriber.lastValue = value;
    updateSubscriberList();
  }
  log(`Основной подписчик: значение изменилось на ${value}`);
});

// Добавляем основной подписчик в список
subscribers.push({
  id: mainSubscriberId,
  lastValue: reactiveObj.value,
  unsubscribe: mainUnsubscribe
});

document.querySelector('.update-value').addEventListener('click', updateValue);
document.querySelector('.add-subscriber').addEventListener('click', addSubscriber);
document.querySelector('.remove-subscriber').addEventListener('click', removeSubscriber);

import code from './getters-setters.js?raw';
    document.querySelector('#codeDisplay').textContent = code;

updateDisplay();
log('Система реактивности инициализирована');