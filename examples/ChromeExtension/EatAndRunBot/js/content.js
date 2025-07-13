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

  initializeWebSocketInterception() {
    const self = this;

    window.addEventListener('message', (event) => {
      if (event.source !== window || !event.data) return;
      if (event.data.type === 'WS_CREATED') {
        console.log('🔍 WebSocket создан:', event.data.payload.url);
        self.currentUserId = event.data.payload.url.match(/id=([0-9a-fA-F-]{36})/)[1];
      }
      if (event.data.type === 'WS_MESSAGE') {
        // Обрабатываем сообщение от WebSocket  ;
        this.handleWebSocketMessage({ data: event.data.payload })
      }
    });

  }

  handleWebSocketMessage(event) {
    if (!this.isActive) return;

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (data.type === 'gameUpdate') {
        this.updateGameState(data);
        this.makeDecision();
      } else if (data.type === 'gameOver') {
        // Отправляем сообщение чтобы закрыть модалку с результатом
        setTimeout(() => {
           window.postMessage({ type: "WS_CLOSE_MESSAGE" }, "*");
        }, 3000); // Задержка перед отправкой сообщения
      }
    } catch (error) {
      // Игнорируем ошибки парсинга
    }
  }

  updateGameState(data) {
    console.log('Обновление состояния игры:', data);
    // Обновляем состояние игры на основе полученных данных
    if (data.players) {
      this.gameState.players = data.players;
      // Находим своего игрока
      this.gameState.myPlayer = data.players.find(p => p.id === this.currentUserId);
    }

    if (data.food) {
      this.gameState.food = data.food;
    }

    if (data.bombs) {
      this.gameState.bombs = data.bombs;
    }

    // Альтернативные форматы данных
    // Если данные приходят в другом формате, например, с полем payload
    if (data.type === 'gameUpdate') {
      this.gameState = { ...this.gameState, ...data.payload };
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
      debugger
      this.currentUserId = window.SOCKET.url.match(/id=(\d+)/)[1];
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
