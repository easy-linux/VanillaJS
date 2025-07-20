class EatAndRunBot {
  constructor() {
    this.isActive = false;
    this.gameState = {
      players: [],
      food: [],
      bombs: [],
      myPlayer: null
    };
    this.settings = {
      aggressiveness: 70, // Уровень агрессивности бота (0-100, 0 - пассивный, 100 - агрессивный)
      avoidDistance: 150, // Дистанция, на которой бот будет избегать игроков
      reactionSpeed: 5, // Скорость реакции бота (1-10, 1 - медленно, 10 - быстро)
      attackDistance: 1000 // Дистанция, на которой бот будет пытаться атаковать игроков  
    };
    this.originalWebSocket = null;
    this.gameWebSocket = null;
    this.lastMove = { x: 0, y: 0 };
    this.decisionInterval = null;
    this.lastDecisionTime = 0;
    this.currentUserId = null;

    this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);

    this.initializeWebSocketInterception();
  }

  /**
   * Декомпрессирует сообщение из нового протокола сжатия
   * @param {Object} compressedMessage - сжатое сообщение
   * @returns {Object} декомпрессированное сообщение
   */
  decompressMessage(compressedMessage) {
    // Создаем копию сообщения для декомпрессии
    const decompressed = JSON.parse(JSON.stringify(compressedMessage));

    // Восстанавливаем полные имена свойств
    if (decompressed.t) {
      decompressed.type = decompressed.t;
      delete decompressed.t;
      if(decompressed.i){
        decompressed.id = decompressed.i;
        delete decompressed.i;
      }
      if(decompressed.p){
        decompressed.players = decompressed.p.map(player => ({
          id: player.i,                           // Короткий ID
          x: player.x,                            // X координата
          y: player.y,                            // Y координата
          size: player.s,                         // s -> size
          name: player.n,                         // n -> name
          isBot: player.b                         // b -> isBot
        }));
        delete decompressed.p;
      }
      if(decompressed.b){
        decompressed.bombs = decompressed.b.map(bomb => ({
          id: bomb.i,                             // Короткий ID
          x: bomb.x,                              // X координата
          y: bomb.y,                              // Y координата
          size: bomb.s                            // s -> size
        }));
        delete decompressed.b;
      }
      if(decompressed.f){
        decompressed.food = decompressed.f.map(food => ({
          id: food.i,                             // Короткий ID
          x: food.x,                              // X координата
          y: food.y,                              // Y координата
          size: food.s                            // s -> size
        }));
        delete decompressed.f;
      }
      // Восстанавливаем таблицу лидеров
      if (decompressed.l) {
        decompressed.leaderBoard = decompressed.l.map(leader => ({
          id: leader.i,                           // Короткий ID
          name: leader.n,                         // n -> name
          size: leader.s                          // s -> size
        }));
        delete decompressed.l;
      }

      // Восстанавливаем информацию об удаленных объектах
      if (decompressed.r) {
        decompressed.removed = {
          players: decompressed.r.p.map(id => ({ id, removed: true })), // Короткий ID
          food: decompressed.r.f.map(id => ({ id, removed: true })),    // Короткий ID
          bombs: decompressed.r.b.map(id => ({ id, removed: true }))    // Короткий ID
        };
        delete decompressed.r;
      }

      // Восстанавливаем текстовое сообщение
      if (decompressed.m) {
        decompressed.message = decompressed.m;
        delete decompressed.m;
      }
    }
    return decompressed;
  }

  initializeWebSocketInterception() {
    const self = this;

    window.addEventListener('message', (event) => {
      if (event.source !== window || !event.data) return;
      if (event.data.type === 'WS_CREATED') {
        console.log('🔍 WebSocket создан:', event.data.payload.url);
        // Извлекаем ID из URL - теперь это может быть короткий ID
        const idMatch = event.data.payload.url.match(/id=([^&]+)/);
        if (idMatch) {
          self.currentUserId = idMatch[1];
          console.log('ID игрока извлечен:', self.currentUserId);
        }
      }
      if (event.data.type === 'WS_MESSAGE') {
        // Обрабатываем сообщение от WebSocket
        this.handleWebSocketMessage({ data: event.data.payload })
      }
    });

  }

  handleWebSocketMessage(event) {
    if (!this.isActive) return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      
      // Декомпрессируем сообщение если оно сжато
      const decompressedData = this.decompressMessage(data);
      
      if (decompressedData.type === 'gameUpdate') {
        this.updateGameState(decompressedData);
        this.makeDecision();
      } else if (decompressedData.type === 'gameOver') {
        // Отправляем сообщение чтобы закрыть модалку с результатом
        setTimeout(() => {
           window.postMessage({ type: "WS_CLOSE_MESSAGE" }, "*");
        }, 3000); // Задержка перед отправкой сообщения
      } else if (decompressedData.type === 'gameRestarted') {
        // Обрабатываем перезапуск игры
        console.log('Игра перезапущена, очищаем состояние бота');
        this.gameState = {
          players: [],
          food: [],
          bombs: [],
          myPlayer: null
        };
      } else if (decompressedData.type === 'init') {
        // Обрабатываем инициализацию игры
        console.log('Игра инициализирована, получаем данные игрока');
        this.currentUserId = decompressedData.id;
      }
    } catch (error) {
      console.error('Ошибка обработки WebSocket сообщения:', error);
      // Игнорируем ошибки парсинга
    }
  }

  updateGameState(data) {
    console.log('Обновление состояния игры:', data);
    
    // Обрабатываем дельта-обновления для игроков
    if (data.players) {
      if (Array.isArray(data.players)) {
        // Проверяем, является ли это дельта-обновлением по наличию удаленных элементов
        if (data.removed && data.removed.players) {
          // Дельта-обновление - применяем изменения
          console.log('Дельта-обновление игроков:', data.players.length, 'игроков');
          data.players.forEach(player => {
            // Находим существующего игрока или создаем нового
            const existingIndex = this.gameState.players.findIndex(p => p.id === player.id);
            if (existingIndex >= 0) {
              this.gameState.players[existingIndex] = player;
            } else {
              this.gameState.players.push(player);
            }
          });
          // Удаляем удаленных игроков
          data.removed.players.forEach(p => {
            if (p.removed) {
              this.gameState.players = this.gameState.players.filter(player => player.id !== p.id);
            }
          });
        } else {
          // Полное обновление
          console.log('Полное обновление игроков:', data.players.length, 'игроков');
          this.gameState.players = data.players;
        }
      }
    }
    
    // Обрабатываем дельта-обновления для еды
    if (data.food) {
      if (Array.isArray(data.food)) {
        // Проверяем, является ли это дельта-обновлением по наличию удаленных элементов
        if (data.removed && data.removed.food) {
          // Дельта-обновление - применяем изменения
          console.log('Дельта-обновление еды:', data.food.length, 'объектов еды');
          data.food.forEach(f => {
            // Находим существующую еду или создаем новую
            const existingIndex = this.gameState.food.findIndex(food => food.id === f.id);
            if (existingIndex >= 0) {
              this.gameState.food[existingIndex] = f;
            } else {
              this.gameState.food.push(f);
            }
          });
          // Удаляем удаленную еду
          data.removed.food.forEach(f => {
            if (f.removed) {
              this.gameState.food = this.gameState.food.filter(food => food.id !== f.id);
            }
          });
        } else {
          // Полное обновление
          console.log('Полное обновление еды:', data.food.length, 'объектов еды');
          this.gameState.food = data.food;
        }
      }
    }
    
    // Обрабатываем дельта-обновления для бомб
    if (data.bombs) {
      if (Array.isArray(data.bombs)) {
        // Проверяем, является ли это дельта-обновлением по наличию удаленных элементов
        if (data.removed && data.removed.bombs) {
          // Дельта-обновление - применяем изменения
          console.log('Дельта-обновление бомб:', data.bombs.length, 'бомб');
          data.bombs.forEach(b => {
            // Находим существующую бомбу или создаем новую
            const existingIndex = this.gameState.bombs.findIndex(bomb => bomb.id === b.id);
            if (existingIndex >= 0) {
              this.gameState.bombs[existingIndex] = b;
            } else {
              this.gameState.bombs.push(b);
            }
          });
          // Удаляем удаленные бомбы
          data.removed.bombs.forEach(b => {
            if (b.removed) {
              this.gameState.bombs = this.gameState.bombs.filter(bomb => bomb.id !== b.id);
            }
          });
        } else {
          // Полное обновление
          console.log('Полное обновление бомб:', data.bombs.length, 'бомб');
          this.gameState.bombs = data.bombs;
        }
      }
    }
    
    // Находим своего игрока (используем короткий ID)
    if (this.currentUserId) {
      // Ищем игрока по короткому ID
      this.gameState.myPlayer = this.gameState.players.find(p => p.id === this.currentUserId);
      
      // Если не нашли по короткому ID, попробуем найти по полному UUID
      if (!this.gameState.myPlayer) {
        this.gameState.myPlayer = this.gameState.players.find(p => p.id && p.id.includes(this.currentUserId));
      }
    }
  }

  makeDecision() {
    const now = Date.now();
    const reactionDelay = (11 - this.settings.reactionSpeed) * 10; // 10-100ms задержка

    if (now - this.lastDecisionTime < reactionDelay) {
      return;
    }

    this.lastDecisionTime = now;

    if (!this.gameState.myPlayer) return;

    const myPlayer = this.gameState.myPlayer;
    const threats = this.findThreats(myPlayer);
    const opportunities = this.findOpportunities(myPlayer);

    // Определяем целевые координаты для движения
    // Приоритеты:
    // 1. Избегание угроз
    // 2. Поиск возможностей (съесть меньшего игрока)
    // 3. Сбор еды
    // Если нет угроз и возможностей, просто собираем ближайшую еду
    let targetX = 0;
    let targetY = 0;

    // Приоритет 1: Избегание угроз
    if (threats.length > 0) {
      const avoidanceVector = this.calculateAvoidanceVector(myPlayer, threats);
      targetX = avoidanceVector.x;
      targetY = avoidanceVector.y;
    }
    // Приоритет 2: Поиск возможностей
    else if (opportunities.length > 0) {
      const opportunity = this.selectBestOpportunity(myPlayer, opportunities);
      const direction = this.calculateDirection(myPlayer, opportunity);
      targetX = direction.x;
      targetY = direction.y;
    }
    // Приоритет 3: Сбор еды
    else {
      const nearestFood = this.findNearestFood(myPlayer);
      if (nearestFood) {
        const direction = this.calculateDirection(myPlayer, nearestFood);
        targetX = direction.x;
        targetY = direction.y;
      }
    }

    this.sendMove(targetX, targetY);
  }

  findThreats(myPlayer) {
    const threats = [...this.gameState.players, ...this.gameState.bombs];

    const playerThreats = this.gameState.players.filter(player => {
      if (player.id === myPlayer.id) return false;

      const distance = this.calculateDistance(myPlayer, player);
      const deltaSize = player.size - myPlayer.size;

      // Игрок опасен если он больше и достаточно близко
      return deltaSize > 2 && distance < this.settings.avoidDistance + myPlayer.size;
    });

    // Добавляем угрозы от бомб
    // Бомбы опасны если они достаточно близко
    const bombsThreats = this.gameState.bombs.filter(bomb => {
      const distance = this.calculateDistance(myPlayer, bomb);
      return distance < this.settings.avoidDistance + myPlayer.size;
    });
    return [...playerThreats, ...bombsThreats];
  }

  findOpportunities(myPlayer) {
    const opportunities = [];

    // Ищем игроков, которых можно съесть
    this.gameState.players.forEach(player => {
      if (player.id === myPlayer.id) return;

      const distance = this.calculateDistance(myPlayer, player);
      const deltaSize = myPlayer.size - player.size;
      const sizeRatio = myPlayer.size / player.size;

      // Можем съесть если мы больше
      if (deltaSize > 2 && distance < this.settings.attackDistance) {
        opportunities.push({
          ...player,
          priority: sizeRatio * (this.settings.attackDistance - distance) / this.settings.attackDistance,
          type: 'player'
        });
      }
    });

    // Ищем еду
    this.gameState.food.forEach(food => {
      const distance = this.calculateDistance(myPlayer, food);
      if (distance < 300) {
        opportunities.push({
          ...food,
          priority: (300 - distance) / 300,
          type: 'food'
        });
      }
    });

    return opportunities;
  }

  findNearestFood(myPlayer) {
    let nearest = null;
    let minDistance = Infinity;

    this.gameState.food.forEach(food => {
      const distance = this.calculateDistance(myPlayer, food);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = food;
      }
    });

    return nearest;
  }

  selectBestOpportunity(myPlayer, opportunities) {
    // Если агрессивность максимальная — всегда выбираем ближайшего меньшего игрока
    if (this.settings.aggressiveness === 100) {
      // Фильтруем только игроков, которых можно съесть
      const ediblePlayers = opportunities.filter(o => o.type === 'player');
      if (ediblePlayers.length > 0) {
        // Выбираем ближайшего игрока
        return ediblePlayers.reduce((nearest, curr) => {
          const distCurr = this.calculateDistance(myPlayer, curr);
          const distNearest = this.calculateDistance(myPlayer, nearest);
          return distCurr < distNearest ? curr : nearest;
        }, ediblePlayers[0]);
      }
      // Если нет игроков — выбираем ближайшую еду
      const food = opportunities.filter(o => o.type === 'food');
      if (food.length > 0) {
        return food.reduce((nearest, curr) => {
          const distCurr = this.calculateDistance(myPlayer, curr);
          const distNearest = this.calculateDistance(myPlayer, nearest);
          return distCurr < distNearest ? curr : nearest;
        }, food[0]);
      }
      // fallback
      return opportunities[0];
    }

    // Для других значений агрессивности — усиливаем приоритет игроков
    const aggressivenessFactor = this.settings.aggressiveness / 100;

    return opportunities.reduce((best, current) => {
      let currentScore = current.priority;

      // Бонус за игроков при высокой агрессивности
      if (current.type === 'player') {
        currentScore *= (1 + aggressivenessFactor * 2); // Усиливаем влияние агрессивности
      }

      return currentScore > best.priority ? current : best;
    }, opportunities[0]);
  }

  // Метод для расчета вектора избегания угроз
  // Учитывает размер игрока и дистанцию избегания
  calculateAvoidanceVector(myPlayer, threats) {
    let avoidX = 0;
    let avoidY = 0;

    threats.forEach(threat => {
      const dx = myPlayer.x - threat.x;
      const dy = myPlayer.y - threat.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > myPlayer.size) {
        const strength = (this.settings.avoidDistance + myPlayer.size) / distance;
        avoidX += (dx / distance) * strength;
        avoidY += (dy / distance) * strength;
      }
    });

    // Нормализуем вектор
    const length = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
    if (length > 0) {
      avoidX /= length;
      avoidY /= length;
    }

    return { x: avoidX, y: avoidY };
  }

  calculateDirection(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: 0, y: 0 };

    return {
      x: dx / distance,
      y: dy / distance
    };
  }

  calculateDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  sendMove(deltaX, deltaY) {

    // Используем дискретные значения направления, имитируя нажатия клавиш: -2, 0, +2
    const step = 2;

    // Округляем входящие значения направления до ближайшего шага
    function quantizeDirection(value) {
      if (value > 0.5) return step;
      if (value < -0.5) return -step;
      return 0;
    }

    // Сохраняем предыдущее направление, чтобы не менять его слишком часто
    const changeCooldown = 80; // ms между сменами направления
    if (!this.lastMoveChangeTime) this.lastMoveChangeTime = 0;
    const now = Date.now();

    let vx = this.lastMove.vx || 0;
    let vy = this.lastMove.vy || 0;
    const newVx = quantizeDirection(deltaX);
    const newVy = quantizeDirection(deltaY);

    // Меняем направление только если прошло достаточно времени или направление не меняется
    if ((newVx !== vx || newVy !== vy) && (now - this.lastMoveChangeTime > changeCooldown)) {
      vx = newVx;
      vy = newVy;
      this.lastMoveChangeTime = now;
    }

    this.lastMove = { vx, vy };

    // Формируем данные для движения
    const moveData = {
      type: 'move',
      vx: vx,
      vy: vy,
      x: vx,
      y: vy
    };

    try {
      window.postMessage({ type: "WS_SEND", payload: JSON.stringify(moveData) }, "*");
    } catch (error) {
      console.error('Ошибка отправки движения:', error);
    }
  }

  start(settings) {
    this.settings = { ...this.settings, ...settings };
    this.isActive = true;

    if (window.SOCKET) {
      // Извлекаем ID из URL WebSocket - теперь это может быть короткий ID
      const idMatch = window.SOCKET.url.match(/id=([^&]+)/);
      if (idMatch) {
        this.currentUserId = idMatch[1];
        console.log('ID игрока извлечен из существующего WebSocket:', this.currentUserId);
      }
      this.gameWebSocket = window.SOCKET;
      window.SOCKET.addEventListener('message', this.handleWebSocketMessage);
      console.log('Используем существующий WebSocket:', this.gameWebSocket);
    }

    // Запускаем периодическое принятие решений как резервный механизм
    this.decisionInterval = setInterval(() => {
      this.makeDecision();
    }, 50); // 20 раз в секунду

    console.log('Бот запущен с настройками:', this.settings);
  }

  stop() {
    this.isActive = false;
    if (window.SOCKET) {
      window.SOCKET.removeEventListener('message', this.handleWebSocketMessage);
      this.gameWebSocket = null;
      console.log('Отключаем WebSocket:', window.SOCKET);
    }
    if (this.decisionInterval) {
      clearInterval(this.decisionInterval);
      this.decisionInterval = null;
    }
    console.log('Бот остановлен');
  }

  getStatus() {
    return {
      active: this.isActive,
      gameState: this.gameState,
      settings: this.settings
    };
  }
}

// Создаем экземпляр бота
const eatAndRunBot = new EatAndRunBot();

// Обработчик сообщений от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'start':
      eatAndRunBot.start(request.settings);
      sendResponse({ success: true });
      break;

    case 'stop':
      eatAndRunBot.stop();
      sendResponse({ success: true });
      break;

    case 'getStatus':
      sendResponse(eatAndRunBot.getStatus());
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Автоматическая остановка при переходе на другую страницу
window.addEventListener('beforeunload', () => {
  eatAndRunBot.stop();
});
