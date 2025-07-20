/**
 * @module Server/Server
 * @category Server
 * @description Основной модуль сервера игры Eat and Run
 * 
 * Этот модуль содержит:
 * - Настройку и запуск Fastify сервера
 * - Регистрацию статических файлов и WebSocket
 * - Обработку WebSocket соединений игроков
 * - Запуск игрового цикла с фиксированной частотой 30 FPS
 * - Интеграцию всех серверных модулей игры
 * 
 * @example
 * // Запуск сервера
 * node server.js
 * 
 * // Сервер автоматически:
 * // - Запускается на порту 3001
 * // - Обслуживает статические файлы из папки dist
 * // - Обрабатывает WebSocket соединения на /ws
 * // - Запускает игровой цикл с частотой 30 FPS
 */

import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "node:path";
import fastifyWebsocket from "@fastify/websocket";
import { gameLoop, startGame } from "./src/server/game.js";
import { addPlayer } from "./src/server/players.js";

/**
 * Создание экземпляра Fastify сервера с включенным логированием
 * Логирование поможет отслеживать запросы и ошибки в процессе разработки
 */
const fastify = Fastify({
  logger: true,
});

/**
 * Регистрация плагина для обслуживания статических файлов
 * Все файлы из папки dist будут доступны по корневому пути /
 * Это позволяет клиентам загружать HTML, CSS, JS и другие ресурсы
 */
await fastify.register(fastifyStatic, {
  root: join(process.cwd(), "dist"),
  prefix: "/",
});

/**
 * Регистрация WebSocket плагина для поддержки real-time соединений
 * WebSocket необходим для передачи игровых данных в реальном времени
 */
await fastify.register(fastifyWebsocket);

/**
 * Регистрация WebSocket маршрута для игровых соединений
 * Каждое соединение создает нового игрока в игре
 */
fastify.register(async (fastify) => {
  /**
   * Обработчик WebSocket соединений на пути /ws
   * @param {WebSocket} ws - WebSocket соединение клиента
   * @param {Object} req - Объект запроса с параметрами
   */
  fastify.get("/ws", { websocket: true }, (ws, req) => {
    // Получение ID клиента из query параметров
    let clientId = req.query.id;
    
    // Добавление нового игрока в игру
    // addPlayer создаст объект игрока и настроит обработчики сообщений
    addPlayer(clientId, ws);
  });
});

/**
 * Инициализация игры при запуске сервера
 * startGame создает начальное состояние игры: еду, бомбы, ботов
 */
startGame();

/**
 * Основной игровой цикл сервера
 * Выполняется с фиксированной частотой 30 FPS (каждые ~33ms)
 * Обеспечивает стабильную частоту обновлений независимо от нагрузки
 */
function loop() {
    // Запоминаем время начала выполнения цикла
    const start = Date.now();
    
    // Выполняем один шаг игровой логики
    // gameLoop обрабатывает движение, столкновения, поедание еды и бомб
    gameLoop();
    
    // Вычисляем задержку для поддержания частоты 30 FPS
    // Если обработка заняла больше времени, задержка будет 0
    const delay = Math.max(0, (1000 / 30) - (Date.now() - start));
    
    // Планируем следующий цикл через вычисленную задержку
    setTimeout(loop, delay);
}

/**
 * Запуск игрового цикла
 * Цикл будет выполняться непрерывно до остановки сервера
 */
loop();

/**
 * Запуск HTTP сервера на порту 3001
 * Сервер слушает на всех сетевых интерфейсах (0.0.0.0)
 * Это позволяет подключаться как с localhost, так и с других устройств в сети
 */
fastify.listen({ port: 3001, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    // В случае ошибки выводим её в лог и завершаем процесс
    fastify.log.error(err);
    process.exit(1);
  }
  
  // Успешный запуск - выводим адрес сервера в лог
  fastify.log.info(`Server listening at ${address}`);
});
