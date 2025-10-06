import { createReactive } from '../utils/reactiveProxy';

// Пример 2: Proxy API
// Гибкий подход с использованием Proxy для перехвата операций

// Счетчик изменений
let changeCount = 0;
const properties = ['city', 'country', 'phone', 'website', 'company', 'position', 
  'department', 'status', 'notes', 'birthday', 'nickname',  'hobby', 'favoriteColor', 
  'petName', 'carModel', 'shoeSize', 'preferredLanguage', 'timezone', 'currency'];

// Создаем реактивный объект
const data = createReactive(
  { name: 'John', age: 30, email: 'john@example.com' },
  ({prop, newValue, oldValue, operation = 'set'}) => {
    changeCount++;
    if (operation === 'delete') {
      log(`Свойство ${prop} удалено (было: ${oldValue})`);
    } else {
      log(`${prop} изменилось с ${oldValue} на ${newValue}`);
    }
    updateDisplay();
  }
);

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
  document.getElementById('currentData').textContent = JSON.stringify(data, null, 2);
  document.getElementById('changeCount').textContent = changeCount;
}

function setRandomData() {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  
  data.name = names[Math.floor(Math.random() * names.length)];
  data.age = Math.floor(Math.random() * 50) + 18;
  data.email = `${data.name.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function addNewProperty() {
  const randomIndes = Math.floor(Math.random() * properties.length);
  const property = properties.splice(randomIndes, 1)[0];
  if (!property) return; // Все свойства уже добавлены
  const values = ['New York', 'USA', '+1-555-0123', 'example.com', 'Tech Corp'];
  const value = values[Math.floor(Math.random() * values.length)];
  
  data[property] = value;
  const inputs = document.querySelector('.inputs');
  const newInputGroup = document.createElement('div');
  newInputGroup.className = 'input-group';
  newInputGroup.innerHTML = `
    <div class="space-between"><label for="${property}Input">${property.charAt(0).toUpperCase() + property.slice(1)}:</label><button class="btn btn-secondary small" data-prop-id="${property}" class="delete-prop">❌</button></div>
    <input type="text" id="${property}Input" value="${value}">
  `;
  inputs.appendChild(newInputGroup);
  
  // Добавляем обработчик для нового поля
  document.getElementById(`${property}Input`).addEventListener('input', (e) => {
    data[property] = e.target.value;
  });

  // Обработчик для удаления свойства
  newInputGroup.querySelector('.delete-prop').addEventListener('click', (e) => {
    const prop = e.target.getAttribute('data-prop-id');
    delete data[prop];
    newInputGroup.remove();
  });
}

function clearLog() {
  document.getElementById('log').innerHTML = '';
  changeCount = 0;
  updateDisplay();
}

// Инициализация
document.getElementById('nameInput').addEventListener('input', (e) => {
  data.name = e.target.value;
});

document.getElementById('ageInput').addEventListener('input', (e) => {
  data.age = parseInt(e.target.value) || 0;
});

document.getElementById('emailInput').addEventListener('input', (e) => {
  data.email = e.target.value;
});

// Event listeners для кнопок
document.querySelector('.set-random-data').addEventListener('click', setRandomData);
document.querySelector('.add-new-property').addEventListener('click', addNewProperty);
document.querySelector('.clear-log').addEventListener('click', clearLog);

// Динамическая загрузка кода
import code from './proxy.js?raw';
document.querySelector('#codeDisplay').textContent = code;

updateDisplay();
log('Система Proxy реактивности инициализирована'); 