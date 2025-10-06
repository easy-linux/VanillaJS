// Счетчики для статистики
let changeCount = 0;
let changeTypes = new Set();

// Функция для создания наблюдателя DOM изменений
function observeElement(element, callback) {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {      
      // Вызываем callback с информацией об изменении
      callback(mutation);
    });
    return observer;
  });
  
  // Настраиваем наблюдение
  observer.observe(element, {
    // Отслеживаем изменения атрибутов
    attributes: true,
    // Отслеживаем изменения дочерних элементов
    childList: true,
    // Отслеживаем изменения в поддереве
    subtree: true,
    // Отслеживаем изменения текстового содержимого
    characterData: true,
    // Отслеживаем изменения старых значений атрибутов
    attributeOldValue: true,
    // Отслеживаем изменения старых значений текста
    characterDataOldValue: true
  });
  
  return observer;
}

const observableElement = document.getElementById('observableElement');

// Функции для демонстрации

// Функция для логирования изменений
function log(message) {
  const logElement = document.getElementById('log');
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-message">${message}</span>`;
  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
}

// Функция для обновления отображения изменений
function updateDisplay() {
  document.getElementById('changeCount').textContent = changeCount;
  document.getElementById('changeTypes').textContent = 
    changeTypes.size > 0 ? Array.from(changeTypes).join(', ') : 'Нет изменений';
  updateDOMTree();
}

// Функция для отрисовки изменений в DOM
function updateDOMTree() {
  const treeElement = document.getElementById('domTree');
  
  function buildDOMTree(node, level = 0) {
    const indent = '  '.repeat(level);
    let result = `${indent}${node.nodeName.toLowerCase()}`;
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.id) result += `#${node.id}`;
      if (node.className) result += `.${node.className.split(' ').join('.')}`;
      // Безопасное получение текста без вызова trim() на самом узле
      const textContent = Array.from(node.childNodes)
        .filter(child => child.nodeType === Node.TEXT_NODE)
        .map(child => child.textContent)
        .join('')
        .trim();
      
      if (textContent) {
        const text = textContent.substring(0, 30);
        if (text.length === 30) result += ` (${text}...)`;
        else result += ` (${text})`;
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent;
      if (textContent.trim()) {
        const text = textContent.trim().substring(0, 30);
        result += `: "${text}${text.length === 30 ? '...' : ''}"`;
      }
    }
    
    result += '\n';
    
    for (let child of node.childNodes) {
      result += buildDOMTree(child, level + 1);
    }
    
    return result;
  }
  
  // Временно отключаем наблюдатель во время обновления дерева
  observer.disconnect();
  treeElement.textContent = buildDOMTree(observableElement);
  // Включаем наблюдатель обратно
  observer.observe(observableElement, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
    attributeOldValue: true,
    characterDataOldValue: true
  });
}

// Функции для добавления, удаления и изменения элементов
function addElement() {
  const newElement = document.createElement('div');
  newElement.textContent = `Новый элемент ${Date.now()}`;
  newElement.style.color = 'blue';
  observableElement.appendChild(newElement);
}

function removeElement() {
  const children = observableElement.children;
  if (children.length > 3) { // Оставляем базовые элементы
    observableElement.removeChild(children[children.length - 1]);
  }
}

// Функции для изменения атрибутов и текста
function changeAttribute() {
  const colors = ['red', 'green', 'blue', 'purple', 'orange'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  observableElement.style.backgroundColor = randomColor;
}

function changeText() {
  const counter = document.getElementById('counter');
  const currentValue = parseInt(counter.textContent) || 0;
  counter.textContent = currentValue + 1;
}

// Функция для очистки лога
function clearLog() {
  document.getElementById('log').innerHTML = '';
  changeCount = 0;
  changeTypes.clear();
  updateDisplay();
}

// Event listeners для кнопок
document.querySelector('.add-element').addEventListener('click', addElement);
document.querySelector('.remove-element').addEventListener('click', removeElement);
document.querySelector('.change-attribute').addEventListener('click', changeAttribute);
document.querySelector('.change-text').addEventListener('click', changeText);
document.querySelector('.clear-log').addEventListener('click', clearLog);

// Создаем наблюдатель

const observer = observeElement(observableElement, (mutation) => {
  changeCount++;
  changeTypes.add(mutation.type);
  
  switch (mutation.type) {
    case 'attributes':
      log(`Атрибут ${mutation.attributeName} изменен`);
      break;
    case 'childList':
      if (mutation.addedNodes.length > 0) {
        log(`Добавлен элемент: ${mutation.addedNodes[0].nodeName}`);
      }
      if (mutation.removedNodes.length > 0) {
        log(`Удален элемент: ${mutation.removedNodes[0].nodeName}`);
      }
      break;
    case 'characterData':
      log(`Текстовое содержимое изменено: "${mutation.oldValue}" → "${mutation.target.textContent}"`);
      break;
  }
  
  updateDisplay();
});

// Динамическая загрузка кода
import code from './mutation-observer.js?raw';
document.querySelector('#codeDisplay').textContent = code;

// Инициализация
updateDisplay();
log('MutationObserver инициализирован'); 