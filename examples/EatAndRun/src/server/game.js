/**
 * @module Server/Game
 * @category Server
 * @description Основной модуль игровой логики сервера
 * 
 * Этот модуль содержит:
 * - Инициализацию и перезапуск игры
 * - Основной игровой цикл с дельта-обновлениями
 * - Адаптивную частоту обновлений
 * - Управление состоянием игры
 * - Проверку условий завершения игры
 * 
 * @example
 * import { startGame, gameLoop, restartGame } from './game.js';
 * 
 * // Инициализация игры
 * startGame();
 * 
 * // Запуск игрового цикла
 * setInterval(gameLoop, 16);
 */

import { MAX_PLAYER_SIZE, messageTypes, ROUND_TIME } from "../constants.js";
import { getBombs, restartBombs, addBomb } from "./bombs.js";
import { getBots, getBotsSnapshot, restartBots } from "./bots.js";
import { addFood, restartFood, getFood } from "./food.js";
import { getPlayers, broadcastGameOver, broadcastMessage, getPlayersSnapshot, restartPlayers } from "./players.js";
import { shortIdGenerator } from "./shortId.js";

// Флаг завершения игры
let gameOver = false;
// Время начала раунда
let roundStart = Date.now();

// Кэш для дельта-обновлений (хранит предыдущее состояние для сравнения)
let lastUpdate = {
    players: new Map(),    // Игроки
    food: new Map(),       // Еда
    bombs: new Map(),      // Бомбы
    leaderBoard: []        // Таблица лидеров
};

// Адаптивная частота обновлений
let lastBroadcastTime = 0;     // Время последней отправки обновления
let updateInterval = 33;       // Начинаем с 30 FPS (33ms)
const MIN_UPDATE_INTERVAL = 16; // Максимум 60 FPS (16ms)
const MAX_UPDATE_INTERVAL = 100; // Минимум 10 FPS (100ms)

/**
 * Инициализация игры - запускается при старте сервера
 * Очищает все состояния и создает начальные объекты
 */
export const startGame = () => {
  console.log('=== Начинаем инициализацию игры ===');
  shortIdGenerator.clear(); // Очищаем маппинги коротких ID
  restartFood();    // Перезапускаем еду
  restartBots();    // Перезапускаем ботов
  restartBombs();   // Перезапускаем бомбы
  
  // Проверяем инициализацию
  const food = getFood();
  const bombs = getBombs();
  console.log('После инициализации - Еда:', food.length, 'Бомбы:', bombs.length);
  
  // Сбрасываем кэш
  lastUpdate = {
      players: new Map(),
      food: new Map(),
      bombs: new Map(),
      leaderBoard: []
  };
  updateInterval = 33;
  lastBroadcastTime = 0;
  
  // Устанавливаем время начала раунда
  roundStart = Date.now();
  gameOver = false;
  
  console.log('=== Инициализация игры завершена ===');
  console.log('Время начала раунда:', new Date(roundStart).toISOString());
};

/**
 * Перезапуск игры - вызывается при завершении раунда
 * Очищает все состояния и уведомляет клиентов о перезапуске
 */
export const restartGame = () => {
    console.log('=== ПЕРЕЗАПУСК ИГРЫ ===');
    console.log('Время перезапуска:', new Date().toISOString());

     // Уведомляем клиентов о перезапуске игры
     const message = {
        type: messageTypes.GAME_RESTARTED,
    };
    broadcastMessage(message);
    
    shortIdGenerator.clear(); // Очищаем маппинги коротких ID
    restartPlayers(); // Перезапускаем игроков
    restartFood();    // Перезапускаем еду
    restartBots();    // Перезапускаем ботов
    restartBombs();   // Перезапускаем бомбы
    gameOver = false; // Сбрасываем флаг завершения
    roundStart = Date.now(); // Обновляем время начала раунда
    
    // Сбрасываем кэш
    lastUpdate = {
        players: new Map(),
        food: new Map(),
        bombs: new Map(),
        leaderBoard: []
    };
    updateInterval = 33;
    lastBroadcastTime = 0;
    
    console.log('=== ПЕРЕЗАПУСК ИГРЫ ЗАВЕРШЕН ===');
}

/**
 * Создает дельта-обновления, сравнивая текущие данные с предыдущими
 * @param {Array} currentData - текущие данные
 * @param {Map} lastData - предыдущие данные в виде Map
 * @param {Function} keyExtractor - функция извлечения ключа из элемента
 * @returns {Object} объект с изменениями, удалениями и флагом полного обновления
 */
const createDeltaUpdate = (currentData, lastData, keyExtractor) => {
    const changes = [];        // Список изменений
    const currentMap = new Map(); // Текущие данные в виде Map для быстрого поиска
    
    // Проходим по текущим данным и находим изменения
    currentData.forEach(item => {
        const key = keyExtractor(item);
        currentMap.set(key, item);
        
        const lastItem = lastData.get(key);
        // Если элемент новый или изменился
        if (!lastItem || JSON.stringify(item) !== JSON.stringify(lastItem)) {
            changes.push(item);
        }
    });
    
    // Находим удаленные элементы
    const removed = [];
    lastData.forEach((item, key) => {
        if (!currentMap.has(key)) {
            removed.push({ id: key, removed: true });
        }
    });
    
    // Если изменений больше 50% от общего количества, делаем полное обновление
    const fullUpdate = changes.length > currentData.length * 0.5;
    
    return { changes, removed, fullUpdate };
};

/**
 * Основной игровой цикл - выполняется каждые 16ms
 * Управляет игровой логикой, обновлениями и проверкой условий завершения
 */
export const gameLoop = () => {
    // Если игра завершена, ждем 10 секунд и перезапускаем
    if (gameOver) {
        const timePassed = Date.now() - roundStart;
        console.log(`Игра завершена. Прошло времени: ${timePassed}ms, ожидаем 10000ms`);
        if (timePassed >= 10000) {
            console.log('Достигнуто время ожидания, запускаем перезапуск игры');
            restartGame();
        }
        return;
    };

    // Получаем текущие данные игры
    const players = getPlayers()      // Активные игроки
    const bots = getBots();           // Боты

    // Добавляем новые объекты в игру
    addFood();    // Добавляем еду если нужно
    addBomb();    // Добавляем бомбы если нужно
    
    // Получаем снапшоты для отправки клиентам
    const playersSnapshot = getPlayersSnapshot();
    const botsSnapshot = getBotsSnapshot();
    const food = getFood();
    const bombs = getBombs();

    // Создаем таблицу лидеров (топ-10 по размеру)
    const leaderBoard = [...players, ...bots]
    .sort((a, b) => b.size - a.size)  // Сортируем по убыванию размера
    .slice(0, 10)                     // Берем топ-10
    .map(player => ({   
        id: player.id,
        name: player.name || 'Без имени',
        size: player.size.toFixed(1),
    }));
    
    // Создаем дельта-обновления для оптимизации трафика
    const allPlayers = [...playersSnapshot, ...botsSnapshot];
    const playerDelta = createDeltaUpdate(allPlayers, lastUpdate.players, p => p.id);
    const foodDelta = createDeltaUpdate(food, lastUpdate.food, f => f.id);
    const bombsDelta = createDeltaUpdate(bombs, lastUpdate.bombs, b => b.id);
    
    // Проверяем, изменилась ли таблица лидеров
    const leaderBoardChanged = JSON.stringify(leaderBoard) !== JSON.stringify(lastUpdate.leaderBoard);
    
    // Вычисляем уровень активности игры
    const totalChanges = playerDelta.changes.length + 
                        foodDelta.changes.length + 
                        bombsDelta.changes.length + 
                        (leaderBoardChanged ? 1 : 0);
    
    // Адаптивная частота обновлений на основе активности
    const now = Date.now();
    const timeSinceLastUpdate = now - lastBroadcastTime;
    
    let shouldUpdate = false;
    
    if (totalChanges > 0) {
        // Высокая активность - обновляем немедленно
        shouldUpdate = true;
        updateInterval = Math.max(MIN_UPDATE_INTERVAL, updateInterval * 0.9); // Увеличиваем частоту
    } else if (timeSinceLastUpdate >= updateInterval) {
        // Низкая активность - обновляем с пониженной частотой
        shouldUpdate = true;
        updateInterval = Math.min(MAX_UPDATE_INTERVAL, updateInterval * 1.1); // Уменьшаем частоту
    }
    
    // Отправляем обновление клиентам если нужно
    if (shouldUpdate) {
        const update = {
            type: messageTypes.GAME_UPDATE,
            players: playerDelta.fullUpdate ? allPlayers : playerDelta.changes,
            food: foodDelta.fullUpdate ? food : foodDelta.changes,
            bombs: bombsDelta.fullUpdate ? bombs : bombsDelta.changes,
            leaderBoard: leaderBoardChanged ? leaderBoard : undefined,
            removed: {
                players: playerDelta.removed,
                food: foodDelta.removed,
                bombs: bombsDelta.removed
            }
        };
        
        // Удаляем undefined поля для уменьшения размера сообщения
        Object.keys(update).forEach(key => {
            if (update[key] === undefined) delete update[key];
        });
        
        broadcastMessage(update);
        lastBroadcastTime = now;
        
        // Обновляем кэш
        lastUpdate.players = new Map(allPlayers.map(p => [p.id, p]));
        lastUpdate.food = new Map(food.map(f => [f.id, f]));
        lastUpdate.bombs = new Map(bombs.map(b => [b.id, b]));
        lastUpdate.leaderBoard = leaderBoard;
    }

    // Проверяем условия завершения игры
    if(!gameOver){
        const alivePlayers = players.filter(player => player.size > 0); // Игроки с размером > 0
        const leader = [...players, ...bots]
        .reduce((max, player) => {
            return player.size > max.size ? player : max;
        }, { size: 0 }); // Находим лидера по размеру

        const timePassed = Date.now() - roundStart;

        // Логируем состояние игры каждые 30 секунд для отладки
        if (timePassed % 30000 < 16) { // Примерно каждые 30 секунд
            console.log(`Состояние игры - Время: ${Math.floor(timePassed/1000)}с, Игроков: ${players.length}, Ботов: ${bots.length}, Лидер: ${leader.name} (${leader.size})`);
        }

        // Условия завершения игры:
        if(alivePlayers.length === 1 && players.length > 1) {
            // Остался только один игрок
            console.log(`Условие завершения: остался только один игрок - ${alivePlayers[0].name}`);
            gameOver = true;
            broadcastGameOver(`Игра окончена! ${alivePlayers[0].name} победил!`);
        } else if(leader.size >= MAX_PLAYER_SIZE ) {
            // Лидер достиг максимального размера
            console.log(`Условие завершения: лидер достиг максимального размера - ${leader.name} (${leader.size})`);
            gameOver = true;
            broadcastGameOver(`Игра окончена! ${leader.name} победил!`);
        } else if (timePassed >= ROUND_TIME) { // 5 минут
            // Время раунда истекло
            console.log(`Условие завершения: время раунда истекло - ${timePassed}ms >= ${ROUND_TIME}ms`);
            gameOver = true;
            broadcastGameOver(`Игра окончена! Время вышло! Победитель: ${leader.name}!`);
        }
    }
}
