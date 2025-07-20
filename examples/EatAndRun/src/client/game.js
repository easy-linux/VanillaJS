/**
 * @module Client/ClientGame
 * @category Client
 * @description Основной модуль игровой логики клиента
 * 
 * Этот модуль содержит:
 * - Класс Game для управления состоянием игры на клиенте
 * - Обработку WebSocket сообщений от сервера
 * - Поддержку дельта-обновлений и полных обновлений
 * - Управление камерой и рендерингом
 * - Хранение игровых объектов в Map для быстрого доступа
 * - Глобальный экземпляр игры
 * 
 * @example
 * import { game } from './game.js';
 * 
 * // Запуск игры
 * game.start();
 * 
 * // Остановка игры
 * game.stop();
 * 
 * // Получение игровых объектов
 * const players = game.players;
 * const food = game.food;
 * const bombs = game.bombs;
 */

import { renderBombs } from "./bombs";
import { renderFood } from "./food";
import { renderLeadersBoard } from "./leadersBoard";
import { renderMap } from "./map";
import { renderPlayers } from "./players";
import { initWS, closeWS } from "./websocket";

/**
 * Основной класс игры на клиентской стороне
 * Управляет состоянием игры, WebSocket соединением и рендерингом
 */
class Game {
  #playerId = null;                          // ID текущего игрока
  #playerName = "John Doe";                 // Имя игрока
  #players = new Map();                      // Хранилище игроков (ID -> объект)
  #bombs = new Map();                        // Хранилище бомб (ID -> объект)
  #food = new Map();                         // Хранилище еды (ID -> объект)
  #me = { x: 0, y: 0, size: 10 };           // Локальный игрок (для центрирования камеры)
  #leaderBoard = [];                         // Таблица лидеров
  #offsetX = 0;                              // Смещение камеры по X
  #offsetY = 0;                              // Смещение камеры по Y

  #animationFrameId = null;                  // ID анимационного кадра
  #canvas = document.getElementById("game"); // Canvas элемент
  #ctx = this.#canvas.getContext("2d");      // Контекст для рисования

  constructor() {
    this.render = this.render.bind(this);    // Привязываем контекст для анимации
  }

  // Геттеры и сеттеры для доступа к приватным полям

  get playerId() {
    return this.#playerId;
  }

  set playerId(id) {
    this.#playerId = id;
  }

  get playerName() {
    return this.#playerName;
  }

  set playerName(name) {
    this.#playerName = name;
  }

  /**
   * Возвращает всех игроков в виде массива
   * @returns {Array} массив всех игроков
   */
  get players() {
    return Array.from(this.#players.values());
  }

  /**
   * Устанавливает игроков, обрабатывая дельта-обновления
   * @param {Array} players - массив игроков
   */
  set players(players) {
    // Обрабатываем дельта-обновления
    if (Array.isArray(players)) {
      // Полное обновление
      this.#players.clear();
      players.forEach(player => {
        this.#players.set(player.id, player);
      });
    } else {
      // Дельта-обновление - не должно происходить с текущей реализацией
      console.warn("Неожиданный формат обновления игроков");
    }
  }

  /**
   * Возвращает все бомбы в виде массива
   * @returns {Array} массив всех бомб
   */
  get bombs() {
    return Array.from(this.#bombs.values());
  }

  /**
   * Устанавливает бомбы, обрабатывая дельта-обновления
   * @param {Array} bombs - массив бомб
   */
  set bombs(bombs) {
    // Обрабатываем дельта-обновления
    if (Array.isArray(bombs)) {
      // Полное обновление
      this.#bombs.clear();
      bombs.forEach(bomb => {
        this.#bombs.set(bomb.id, bomb);
      });
    } else {
      // Дельта-обновление - не должно происходить с текущей реализацией
      console.warn("Неожиданный формат обновления бомб");
    }
  }

  /**
   * Возвращает всю еду в виде массива
   * @returns {Array} массив всей еды
   */
  get food() {
    return Array.from(this.#food.values());
  }

  /**
   * Устанавливает еду, обрабатывая дельта-обновления
   * @param {Array} food - массив еды
   */
  set food(food) {
    // Обрабатываем дельта-обновления
    if (Array.isArray(food)) {
      // Полное обновление
      this.#food.clear();
      food.forEach(f => {
        this.#food.set(f.id, f);
      });
    } else {
      // Дельта-обновление - не должно происходить с текущей реализацией
      console.warn("Неожиданный формат обновления еды");
    }
  }

  get leaderBoard() {
    return this.#leaderBoard;
  }

  set leaderBoard(leaderBoard) {
    this.#leaderBoard = leaderBoard;
  }

  get me() {
    return this.#me;
  }

  get offsetX() {
    return this.#offsetX;
  }

  set offsetX(offset) {
    this.#offsetX = offset;
  }

  get offsetY() {
    return this.#offsetY;
  }

  set offsetY(offset) {
    this.#offsetY = offset;
  }

  get canvas() {
    return this.#canvas;
  }

  get ctx() {
    return this.#ctx;
  }

  /**
   * Запускает игру
   * Инициализирует WebSocket соединение и начинает рендеринг
   */
  start() {
    initWS({
      playerName: this.#playerName,
      onInit: (id) => {
        this.playerId = id;
        console.log('Игрок инициализирован с ID:', id);
      },
      onUpdate: (msg) => {
        console.log('Получено обновление:', msg);
        
        // Обрабатываем дельта-обновления для игроков
        if (msg.players) {
          if (Array.isArray(msg.players)) {
            // Проверяем, является ли это дельта-обновлением по наличию удаленных элементов
            if (msg.removed && msg.removed.players) {
              // Дельта-обновление - применяем изменения
              console.log('Дельта-обновление игроков:', msg.players.length, 'игроков');
              msg.players.forEach(player => {
                this.#players.set(player.id, player);
              });
              // Удаляем удаленных игроков
              msg.removed.players.forEach(p => {
                if (p.removed) this.#players.delete(p.id);
              });
            } else {
              // Полное обновление
              console.log('Полное обновление игроков:', msg.players.length, 'игроков');
              this.players = msg.players;
            }
          }
        }
        
        // Обрабатываем дельта-обновления для еды
        if (msg.food) {
          if (Array.isArray(msg.food)) {
            // Проверяем, является ли это дельта-обновлением по наличию удаленных элементов
            if (msg.removed && msg.removed.food) {
              // Дельта-обновление - применяем изменения
              console.log('Дельта-обновление еды:', msg.food.length, 'объектов еды');
              msg.food.forEach(f => {
                this.#food.set(f.id, f);
              });
              // Удаляем удаленную еду
              msg.removed.food.forEach(f => {
                if (f.removed) this.#food.delete(f.id);
              });
            } else {
              // Полное обновление
              console.log('Полное обновление еды:', msg.food.length, 'объектов еды');
              this.food = msg.food;
            }
          }
        }
        
        // Обрабатываем дельта-обновления для бомб
        if (msg.bombs) {
          if (Array.isArray(msg.bombs)) {
            // Проверяем, является ли это дельта-обновлением по наличию удаленных элементов
            if (msg.removed && msg.removed.bombs) {
              // Дельта-обновление - применяем изменения
              console.log('Дельта-обновление бомб:', msg.bombs.length, 'бомб');
              msg.bombs.forEach(b => {
                this.#bombs.set(b.id, b);
              });
              // Удаляем удаленные бомбы
              msg.removed.bombs.forEach(b => {
                if (b.removed) this.#bombs.delete(b.id);
              });
            } else {
              // Полное обновление
              console.log('Полное обновление бомб:', msg.bombs.length, 'бомб');
              this.bombs = msg.bombs;
            }
          }
        }
        
        // Обновляем таблицу лидеров
        if (msg.leaderBoard) {
          this.leaderBoard = msg.leaderBoard;
        }
        
        // Обновляем позицию локального игрока
        const localPlayer = this.#players.get(this.#playerId);
        if (localPlayer) {
          this.#me.x = localPlayer.x;
          this.#me.y = localPlayer.y;
          this.#me.size = localPlayer.size;
        }
        
        console.log('Текущее состояние - Игроки:', this.players.length, 'Еда:', this.food.length, 'Бомбы:', this.bombs.length);
      },
      onClose: () => {
        this.stop();
      },
      onGameOver: (msg) => {
        const message = document.querySelector(".modal-message");
        const modal = document.querySelector("#game-over-panel");
        if (message) {
          message.textContent = msg.message || "Игра окончена!";
        }
        if (modal) {
          modal.style.display = "flex";
        }
      },
      onGameRestart: () => {
        console.log('Получено уведомление о перезапуске игры');
        // Очищаем все игровые данные при перезапуске
        this.#players.clear();
        this.#food.clear();
        this.#bombs.clear();
        this.#leaderBoard = [];
        
        // Сбрасываем позицию игрока
        this.#me.x = 0;
        this.#me.y = 0;
        this.#me.size = 10;
        
        console.log('Игровые данные очищены после перезапуска');

        // Перезапускаем игру
        this.start();
      },
    });

    this.render();
  }

  /**
   * Основной цикл рендеринга
   * Обновляет позицию камеры, очищает canvas и отрисовывает все игровые объекты
   */
  render() {
    // Центрируем камеру на игроке
    this.offsetX = this.#me.x - this.canvas.width / 2;
    this.offsetY = this.#me.y - this.canvas.height / 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Отладочный рендеринг при отсутствии данных
    if (this.players.length === 0 && this.food.length === 0 && this.bombs.length === 0) {
      // Рисуем сообщение когда нет данных
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Ожидание игровых данных...', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = '14px Arial';
      this.ctx.fillText(`Игроки: ${this.players.length}, Еда: ${this.food.length}, Бомбы: ${this.bombs.length}`, 
                        this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    // Отрисовываем все игровые объекты
    renderPlayers();
    renderFood();
    renderMap();
    renderLeadersBoard();
    renderBombs();

    // Запрашиваем следующий кадр анимации
    this.#animationFrameId = requestAnimationFrame(() => this.render());
  }

  /**
   * Останавливает игру
   * Отменяет анимацию и закрывает WebSocket соединение
   */
  stop() {
    if (this.#animationFrameId) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }
    closeWS();
  }
}

// Глобальный экземпляр игры
export const game = new Game();
