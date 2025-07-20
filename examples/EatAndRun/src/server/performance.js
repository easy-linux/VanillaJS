/**
 * @module Server/Performance
 * @category Server
 * @description Модуль мониторинга производительности сервера
 * 
 * Этот модуль содержит:
 * - Класс PerformanceMonitor для отслеживания метрик
 * - Мониторинг сетевого трафика и сжатия
 * - Статистику коротких ID
 * - Автоматический вывод статистики в консоль
 * - Метрики производительности в реальном времени
 * 
 * @example
 * import { performanceMonitor } from './performance.js';
 * 
 * // Запись метрик сообщения
 * performanceMonitor.recordMessage(originalMessage, compressedMessage);
 * 
 * // Запись обновления
 * performanceMonitor.recordUpdate();
 * 
 * // Получение статистики
 * const stats = performanceMonitor.getStats();
 * 
 * // Вывод статистики в консоль
 * performanceMonitor.logStats();
 */

// Утилита для мониторинга производительности
class PerformanceMonitor {
    constructor() {
        // Метрики производительности
        this.metrics = {
            messagesSent: 0,                 // Количество отправленных сообщений
            totalBytesSent: 0,               // Общее количество отправленных байт
            averageMessageSize: 0,           // Средний размер сообщения
            updatesPerSecond: 0,             // Обновлений в секунду
            lastUpdateTime: Date.now(),      // Время последнего обновления
            updateCount: 0,                  // Счетчик обновлений
            compressionRatio: 0,             // Коэффициент сжатия
            totalOriginalSize: 0,            // Общий размер оригинальных сообщений
            totalCompressedSize: 0,          // Общий размер сжатых сообщений
            shortIdStats: {
                totalIds: 0,                 // Общее количество ID
                averageIdLength: 0           // Средняя длина ID
            }
        };
        
        this.startTime = Date.now();         // Время запуска монитора
    }

    /**
     * Записывает метрики отправленного сообщения
     * Вычисляет размеры, коэффициенты сжатия и статистику коротких ID
     * @param {Object} message - оригинальное сообщение
     * @param {Object} compressedMessage - сжатое сообщение
     */
    recordMessage(message, compressedMessage) {
        const originalSize = JSON.stringify(message).length;      // Размер оригинального сообщения
        const compressedSize = JSON.stringify(compressedMessage).length; // Размер сжатого сообщения
        
        this.metrics.messagesSent++;
        this.metrics.totalBytesSent += compressedSize;
        this.metrics.totalOriginalSize += originalSize;
        this.metrics.totalCompressedSize += compressedSize;
        this.metrics.averageMessageSize = this.metrics.totalBytesSent / this.metrics.messagesSent;
        this.metrics.compressionRatio = this.metrics.totalCompressedSize / this.metrics.totalOriginalSize;
        
        // Отслеживаем выгоду от сжатия ID
        this.updateShortIdStats(message);
    }

    /**
     * Обновляет статистику коротких ID в сообщении
     * Подсчитывает количество и среднюю длину ID в различных типах объектов
     * @param {Object} message - сообщение для анализа
     */
    updateShortIdStats(message) {
        let totalIds = 0;                    // Общее количество ID
        let totalIdLength = 0;               // Общая длина всех ID
        
        // Подсчитываем ID в игроках
        if (message.players) {
            message.players.forEach(player => {
                totalIds++;
                totalIdLength += player.id.length;
            });
        }
        
        // Подсчитываем ID в еде
        if (message.food) {
            message.food.forEach(food => {
                totalIds++;
                totalIdLength += food.id.length;
            });
        }
        
        // Подсчитываем ID в бомбах
        if (message.bombs) {
            message.bombs.forEach(bomb => {
                totalIds++;
                totalIdLength += bomb.id.length;
            });
        }
        
        // Обновляем статистику если есть ID
        if (totalIds > 0) {
            this.metrics.shortIdStats.totalIds = totalIds;
            this.metrics.shortIdStats.averageIdLength = totalIdLength / totalIds;
        }
    }

    /**
     * Записывает факт обновления игры
     * Вычисляет частоту обновлений в секунду
     */
    recordUpdate() {
        this.metrics.updateCount++;
        const now = Date.now();
        const timeDiff = now - this.metrics.lastUpdateTime;
        
        if (timeDiff >= 1000) { // Обновляем каждую секунду
            this.metrics.updatesPerSecond = this.metrics.updateCount;
            this.metrics.updateCount = 0;
            this.metrics.lastUpdateTime = now;
        }
    }

    /**
     * Получает текущую статистику производительности
     * @returns {Object} объект со всеми метриками производительности
     */
    getStats() {
        const uptime = Date.now() - this.startTime;
        return {
            uptime: Math.round(uptime / 1000),                    // Время работы в секундах
            messagesSent: this.metrics.messagesSent,              // Количество сообщений
            averageMessageSize: Math.round(this.metrics.averageMessageSize), // Средний размер
            updatesPerSecond: this.metrics.updatesPerSecond,      // Обновлений в секунду
            compressionRatio: Math.round(this.metrics.compressionRatio * 100) / 100, // Коэффициент сжатия
            totalBytesSent: this.metrics.totalBytesSent,          // Общий трафик
            bytesPerSecond: Math.round(this.metrics.totalBytesSent / (uptime / 1000)), // Байт в секунду
            shortIdStats: this.metrics.shortIdStats               // Статистика коротких ID
        };
    }

    /**
     * Выводит статистику производительности в консоль
     * Форматирует данные для удобного чтения
     */
    logStats() {
        const stats = this.getStats();
        console.log('Статистика производительности:', {
            uptime: `${stats.uptime}с`,
            messagesSent: stats.messagesSent,
            avgMessageSize: `${stats.averageMessageSize} байт`,
            updatesPerSecond: stats.updatesPerSecond,
            compressionRatio: `${(stats.compressionRatio * 100).toFixed(1)}%`,
            bandwidth: `${stats.bytesPerSecond} байт/с`,
            shortIds: `${stats.shortIdStats.totalIds} ID, средняя длина: ${stats.shortIdStats.averageIdLength.toFixed(1)} символов`
        });
    }
}

// Глобальный экземпляр монитора производительности
export const performanceMonitor = new PerformanceMonitor();

// Выводим статистику каждые 30 секунд
setInterval(() => {
    performanceMonitor.logStats();
}, 30000); 