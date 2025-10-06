import { createReactive } from "../utils/reactiveProxy";
import { Reactive, ComputedReactive } from "../utils/reactiveClassAdvanced";

// Todo приложение с использованием всех подходов к реактивности

// Класс Todo
class Todo {
  constructor(id, text, completed = false) {
    this.id = id;
    this.text = text;
    this.completed = completed;
    this.createdAt = new Date();
  }
}

const createReactiveTodo = ({ id, text, completed }, onChange) => {
  return createReactive(new Todo(id ?? Date.now(), text, completed), onChange);
};

// Реактивное состояние приложения
const todos = new Reactive([]);
const filter = new Reactive("all"); // all, active, completed
const newTodoText = new Reactive("");

// Вычисляемые свойства
const filteredTodos = new ComputedReactive(() => {
  switch (filter.value) {
    case "active":
      return todos.value.filter((todo) => !todo.completed);
    case "completed":
      return todos.value.filter((todo) => todo.completed);
    default:
      return todos.value;
  }
}, [todos, filter]);

const stats = new ComputedReactive(() => {
  const total = todos.value.length;
  const completed = todos.value.filter((todo) => todo.completed).length;
  const active = total - completed;
  const percentCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, active, percentCompleted };
}, [todos]);

const onProxyChange = ({ prop, newValue, oldValue, operation = "set" }, obj) => {
  logChange("Todo", `Задача "${obj.text}" property "${prop}" изменено с "${oldValue}" на "${newValue}"`);
};

// Функции для работы с Todo
function addTodo() {
  const text = newTodoText.value.trim();
  if (text) {
    const newTodo = createReactiveTodo({ text, completed: false }, onProxyChange);

    todos.value = [...todos.value, newTodo];
    newTodoText.value = "";
    logChange("Todo", `Добавлена задача: "${text}"`);
  }
}

function toggleTodo(id) {
  const todo = todos.value.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    logChange("Todo", `Задача "${todo.text}" ${todo.completed ? "выполнена" : "не выполнена"}`);
    rerenderTodo(id);
    todos.value = [...todos.value]; // Триггерим обновление зависимых вычисляемых свойств
  }
}

function deleteTodo(id) {
  const todo = todos.value.find((t) => t.id === id);
  todos.value = todos.value.filter((todo) => todo.id !== id);
  logChange("Todo", `Удалена задача: "${todo.text}"`);
}

function clearCompleted() {
  const completedCount = todos.value.filter((todo) => todo.completed).length;
  todos.value = todos.value.filter((todo) => !todo.completed);
  logChange("Todo", `Удалено выполненных задач: ${completedCount}`);
}

function setFilter(newFilter) {
  filter.value = newFilter;
  logChange("Filter", `Установлен фильтр: ${newFilter}`);
}

function createTodoHtml(todo) {
  const todoItem = document.createElement("div");
    todoItem.className = `todo-item ${todo.completed ? "completed" : ""}`;
    todoItem.setAttribute("data-todo-item", todo.id);
    todoItem.innerHTML = `
      <input type="checkbox" name="todo-checkbod=${todo.id}" ${todo.completed ? "checked" : ""} 
             data-todo-id="${todo.id}">
      <span class="todo-text">${todo.text}</span>
      <button class="replace-btn" data-todo-id="${todo.id}">🔂</button>
      <button class="delete-btn" data-todo-id="${todo.id}">×</button>
    `;
    return todoItem;
}

function rerenderTodo(id) {
  const todo = todos.value.find((t) => t.id === id);
  if (todo) {
    const todoElement = document.querySelector(`.todo-item[data-todo-item='${id}']`);
    if (todoElement) {
      const newTodoElement = createTodoHtml(todo);
      todoElement.replaceWith(newTodoElement);
    }
  }
}

// Функции для отображения
function renderTodos() {
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "";

  filteredTodos.value.forEach((todo) => {
    const todoItem = createTodoHtml(todo);
    todoList.appendChild(todoItem);
  });
}

function renderStats() {
  const statsDisplay = document.getElementById("statsDisplay");
  const { total, completed, active, percentCompleted } = stats.value;

  statsDisplay.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Всего:</span>
      <span class="stat-value">${total}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Активных:</span>
      <span class="stat-value">${active}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Выполнено:</span>
      <span class="stat-value">${completed}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Прогресс:</span>
      <span class="stat-value">${percentCompleted}%</span>
    </div>
  `;
}

function updateNewTodoInput() {
  const input = document.getElementById("newTodoInput");
  input.value = newTodoText.value;
}

// Функция для подписки на все обработчики событий
function subscribeHandlers() {
  // Подписчики для автоматического обновления UI
  filteredTodos.subscribe(({oldValue, newValue}) => {
    logChange("filteredTodos", `Changed list`);
    renderTodos();
  });

  stats.subscribe(({oldValue, newValue}) => {
    logChange("stats", `Changed stats`);
    renderStats();
  });

  newTodoText.subscribe(({oldValue, newValue}) => {
    logChange("newTodoText", `Changed ${oldValue} -> ${newValue}`);
    updateNewTodoInput();
  });

  // Обработчики событий DOM
  const newTodoInput = document.getElementById("newTodoInput");
  const addTodoBtn = document.querySelector(".input-group .btn");
  const filterButtons = document.querySelector(".filter-buttons");

  // Обработчик для ввода новой задачи
  newTodoInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addTodo();
    }
  });

  // Синхронизация ввода с реактивным свойством
  newTodoInput.addEventListener("input", (event) => {
    newTodoText.value = event.target.value;
  });

  // Обработчик для кнопки добавления задачи
  addTodoBtn.addEventListener("click", addTodo);

  // Обработчики для кнопок фильтра и действий
  filterButtons.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    const filter = event.target.dataset.filter;

    if (action === "addTodo") {
      addTodo();
    } else if (action === "setFilter") {
      setFilter(filter);
      // Обновляем активную кнопку
      const allButtons = filterButtons.querySelectorAll(".filter-btn");
      allButtons.forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active");
    } else if (action === "clearCompleted") {
      clearCompleted();
    }
  });

  // Делегирование событий для динамически созданных элементов
  document.addEventListener("click", (event) => {
    // Обработчик для чекбоксов задач
    if (event.target.type === "checkbox" && event.target.closest(".todo-item")) {
      const todoId = parseInt(event.target.getAttribute("data-todo-id"));
      toggleTodo(todoId);
    }

    // Обработчик для кнопок удаления
    if (event.target.classList.contains("delete-btn")) {
      const todoId = parseInt(event.target.getAttribute("data-todo-id"));
      deleteTodo(todoId);
    }

    // Обработчик для кнопок замены
    if (event.target.classList.contains("replace-btn")) {
      const todoId = parseInt(event.target.getAttribute("data-todo-id"));
      const todo = todos.value.find((t) => t.id === todoId);
      if (todo) {
        const idx = todos.value.indexOf(todo);
        const text = newTodoText.value.trim();
        if (text) {
          const newTodo = createReactiveTodo({ text, completed: todo.completed }, onProxyChange);
          todos.value[idx] = newTodo;
        }
      }
    }
  });
}

function logChange(source, message) {
  const log = document.getElementById("log");
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement("div");
  logEntry.innerHTML = `<strong>${timestamp}</strong> [${source}]: ${message}`;
  log.insertBefore(logEntry, log.firstChild);

  if (log.children.length > 10) {
    log.removeChild(log.lastChild);
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  // Добавляем несколько тестовых задач
  const initialTodos = [
    createReactiveTodo({ id: 1, text: "Изучить реактивность в JavaScript", completed: true }, onProxyChange),
    createReactiveTodo({ id: 2, text: "Создать демо-проект", completed: false }, onProxyChange),
    createReactiveTodo({ id: 3, text: "Подготовить презентацию", completed: false }, onProxyChange),
  ];

  todos.value = initialTodos;

  // Подписываемся на все обработчики событий
  subscribeHandlers();

  renderTodos();
  renderStats();

  logChange("System", "Todo приложение инициализировано");
});

// Экспортируем для возможного использования в других модулях
export {
  Reactive,
  ComputedReactive,
  Todo,
  todos,
  filter,
  newTodoText,
  filteredTodos,
  stats,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  setFilter,
  logChange,
};

// Динамическая загрузка кода
import code from "./advanced-system?raw";
document.querySelector("#codeDisplay").textContent = code;
