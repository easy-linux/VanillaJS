/**
 * @module Common/Compression
 * @category Common
 * @description Модуль сжатия и декомпрессии WebSocket сообщений
 * 
 * Этот модуль содержит:
 * - Сжатие сообщений для уменьшения сетевого трафика
 * - Декомпрессию сообщений на клиенте
 * - Сокращение имен свойств (type→t, id→i, size→s, name→n)
 * - Округление координат для уменьшения размера
 * - Поддержку коротких ID в сжатых сообщениях
 * 
 * @example
 * import { compressMessage, decompressMessage } from './compression.js';
 * 
 * // Сжатие сообщения для отправки
 * const originalMessage = { type: 'update', players: [...] };
 * const compressed = compressMessage(originalMessage);
 * 
 * // Декомпрессия полученного сообщения
 * const decompressed = decompressMessage(compressedMessage);
 */

// Простая утилита сжатия для WebSocket сообщений
/**
 * Сжимает сообщение для отправки по сети
 * Уменьшает размер сообщения путем сокращения имен свойств и округления значений
 * @param {Object} message - исходное сообщение
 * @returns {Object} сжатое сообщение
 */
export const compressMessage = (message) => {
    // Удаляем ненужные пробелы и используем короткие имена свойств
    const compressed = {
        t: message.type, // type -> t
    };

    if(message.id){
        compressed.i = message.id; // id -> i
    }
    
    // Сжимаем данные игроков
    if (message.players) {
        compressed.p = message.players.map(player => ({
            i: player.id,                           // id -> i (теперь используем короткие ID)
            x: Math.round(player.x),                // Округляем координаты для уменьшения точности
            y: Math.round(player.y),
            s: Math.round(player.size * 10) / 10,   // size -> s, округляем до 1 знака после запятой
            n: player.name,                         // name -> n
            b: player.isBot || false                // isBot -> b
        }));
    }
    
    // Сжимаем данные еды
    if (message.food) {
        compressed.f = message.food.map(food => ({
            i: food.id,                             // id -> i (теперь используем короткие ID)
            x: Math.round(food.x),                  // Округляем координаты
            y: Math.round(food.y),
            s: food.size                            // size -> s
        }));
    }
    
    // Сжимаем данные бомб
    if (message.bombs) {
        compressed.b = message.bombs.map(bomb => ({
            i: bomb.id,                             // id -> i (теперь используем короткие ID)
            x: Math.round(bomb.x),                  // Округляем координаты
            y: Math.round(bomb.y),
            s: bomb.size                            // size -> s
        }));
    }
    
    // Сжимаем таблицу лидеров
    if (message.leaderBoard) {
        compressed.l = message.leaderBoard.map(leader => ({
            i: leader.id,                           // id -> i (теперь используем короткие ID)
            n: leader.name,                         // name -> n
            s: leader.size                          // size -> s
        }));
    }
    
    // Сжимаем информацию об удаленных объектах
    if (message.removed) {
        compressed.r = {
            p: message.removed.players?.map(p => p.id) || [], // Используем короткие ID
            f: message.removed.food?.map(f => f.id) || [],    // Используем короткие ID
            b: message.removed.bombs?.map(b => b.id) || []    // Используем короткие ID
        };
    }
    
    // Добавляем текстовое сообщение если есть
    if (message.message) {
        compressed.m = message.message;
    }
    
    return compressed;
};

/**
 * Декомпрессирует сообщение, полученное с сервера
 * Восстанавливает полные имена свойств и структуру данных
 * @param {Object} compressed - сжатое сообщение
 * @returns {Object} декомпрессированное сообщение
 */
export const decompressMessage = (compressed) => {
    const message = {
        type: compressed.t // t -> type
    };

    if(compressed.i){
        message.id = compressed.i; // i -> id
    }
    
    // Восстанавливаем данные игроков
    if (compressed.p) {
        message.players = compressed.p.map(player => ({
            id: player.i,                           // Короткий ID
            x: player.x,                            // X координата
            y: player.y,                            // Y координата
            size: player.s,                         // s -> size
            name: player.n,                         // n -> name
            isBot: player.b                         // b -> isBot
        }));
    }
    
    // Восстанавливаем данные еды
    if (compressed.f) {
        message.food = compressed.f.map(food => ({
            id: food.i,                             // Короткий ID
            x: food.x,                              // X координата
            y: food.y,                              // Y координата
            size: food.s                            // s -> size
        }));
    }
    
    // Восстанавливаем данные бомб
    if (compressed.b) { // bombs, не food
        message.bombs = compressed.b.map(bomb => ({
            id: bomb.i,                             // Короткий ID
            x: bomb.x,                              // X координата
            y: bomb.y,                              // Y координата
            size: bomb.s                            // s -> size
        }));
    }
    
    // Восстанавливаем таблицу лидеров
    if (compressed.l) {
        message.leaderBoard = compressed.l.map(leader => ({
            id: leader.i,                           // Короткий ID
            name: leader.n,                         // n -> name
            size: leader.s                          // s -> size
        }));
    }
    
    // Восстанавливаем информацию об удаленных объектах
    if (compressed.r) {
        message.removed = {
            players: compressed.r.p.map(id => ({ id, removed: true })), // Короткий ID
            food: compressed.r.f.map(id => ({ id, removed: true })),    // Короткий ID
            bombs: compressed.r.b.map(id => ({ id, removed: true }))    // Короткий ID
        };
    }
    
    // Восстанавливаем текстовое сообщение
    if (compressed.m) {
        message.message = compressed.m;
    }
    
    return message;
}; 