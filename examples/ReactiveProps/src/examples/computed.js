import { Reactive, ComputedReactive } from '../utils/reactiveClass';

// Создание зависимых значений, которые автоматически пересчитываются

// Создаем реактивные значения
const firstName = new Reactive('John');
const lastName = new Reactive('Doe');
const age = new Reactive(30);
const salary = new Reactive(50000);

// Создаем вычисляемые свойства
const fullName = new ComputedReactive(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

const ageCategory = new ComputedReactive(
  () => {
    if (age.value < 18) return 'Несовершеннолетний';
    if (age.value < 30) return 'Молодой';
    if (age.value < 60) return 'Взрослый';
    return 'Пенсионер';
  },
  [age]
);

const yearlySalary = new ComputedReactive(
  () => `$${(salary.value * 12).toLocaleString()}`,
  [salary]
);

// Дополнительное вычисляемое свойство для демонстрации
const personInfo = new ComputedReactive(
  () => {
    return `${fullName.value} (${age.value} лет, ${ageCategory.value}) - ${yearlySalary.value}/год`;
  },
  [fullName, age, ageCategory, yearlySalary]
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
  document.getElementById('fullName').textContent = fullName.value;
  document.getElementById('ageCategory').textContent = ageCategory.value;
  document.getElementById('yearlySalary').textContent = yearlySalary.value;
  document.getElementById('personInfo').textContent = personInfo.value;
}

function setRandomData() {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
  
  firstName.value = names[Math.floor(Math.random() * names.length)];
  lastName.value = surnames[Math.floor(Math.random() * surnames.length)];
  age.value = Math.floor(Math.random() * 50) + 18;
  salary.value = Math.floor(Math.random() * 50000) + 30000;
  
  // Обновляем поля ввода
  document.getElementById('firstNameInput').value = firstName.value;
  document.getElementById('lastNameInput').value = lastName.value;
  document.getElementById('ageInput').value = age.value;
  document.getElementById('salaryInput').value = salary.value;
}

function addComputedProperty() {
  // Создаем новое вычисляемое свойство для демонстрации
  const bonus = new ComputedReactive(
    () => salary.value * 0.1, // 10% бонус
    [salary]
  );
  
  const resultsDiv = document.querySelector('.results');
  const bonusDiv = document.createElement('div');
  bonusDiv.innerHTML = `<div class="card">
          <h4>Бонус (10% от зарплаты):</h4>
          <div class="display" id="bonusValue">${bonus.value}</div>
        </div>`
  resultsDiv.appendChild(bonusDiv);
  
  // Обновляем отображение бонуса при изменении зарплаты
  bonus.subscribe(({oldValue, newValue}) => {
    document.getElementById('bonusValue').textContent = newValue;
    log(`Новое вычисляемое свойство: бонус = $${newValue.toLocaleString()}`);
  });
  log('Добавлено новое вычисляемое свойство: бонус (10% от зарплаты)');
}

function clearLog() {
  document.getElementById('log').innerHTML = '';
}

// Инициализация
document.getElementById('firstNameInput').addEventListener('input', (e) => {
  firstName.value = e.target.value;
});

document.getElementById('lastNameInput').addEventListener('input', (e) => {
  lastName.value = e.target.value;
});

document.getElementById('ageInput').addEventListener('input', (e) => {
  age.value = parseInt(e.target.value) || 0;
});

document.getElementById('salaryInput').addEventListener('input', (e) => {
  salary.value = parseInt(e.target.value) || 0;
});

// Event listeners для кнопок
document.querySelector('.set-random-data').addEventListener('click', setRandomData);
document.querySelector('.add-computed-property').addEventListener('click', addComputedProperty);
document.querySelector('.clear-log').addEventListener('click', clearLog);

// Подписываемся на изменения для логирования
firstName.subscribe(({oldValue, newValue}) => {
  log(`Имя изменено на: ${oldValue} -> ${newValue}`);
});
lastName.subscribe(({oldValue, newValue}) => { 
  log(`Фамилия изменена на: ${oldValue} -> ${newValue}`);
});
age.subscribe(({oldValue, newValue}) => {
  log(`Возраст изменен на: ${oldValue} -> ${newValue}`);
});
salary.subscribe(({oldValue, newValue}) => {
  log(`Зарплата изменена на: $${newValue.toLocaleString()}`);
});

// Подписываемся на изменения вычисляемых свойств
fullName.subscribe(({oldValue, newValue}) => { 
  log(`Полное имя обновлено: ${oldValue} -> ${newValue}`);
  updateDisplay();  
});
ageCategory.subscribe(({oldValue, newValue}) => {
  log(`Возрастная категория обновлена: ${oldValue} -> ${newValue}`);
  updateDisplay();
});
yearlySalary.subscribe(({oldValue, newValue}) => {
  log(`Годовая зарплата обновлена: ${oldValue} -> ${newValue}`);
  updateDisplay();
});
personInfo.subscribe(({oldValue, newValue}) => {
  log(`Информация о пользователе обновлена: ${oldValue} -> ${newValue}`);
  updateDisplay();
});

// Динамическая загрузка кода
import code from './computed.js?raw';
document.querySelector('#codeDisplay').textContent = code;

updateDisplay();
log('Система вычисляемых свойств инициализирована'); 