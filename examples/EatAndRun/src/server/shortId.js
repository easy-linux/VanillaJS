/**
 * @module Server/ShortId
 * @category Server
 * @description Модуль генератора коротких ID для оптимизации сетевого трафика
 * 
 * Этот модуль содержит:
 * - Класс ShortIdGenerator для создания коротких ID
 * - Маппинг между короткими ID и полными UUID
 * - Генерацию base-62 коротких ID длиной 2-4 символа
 * - Вспомогательные функции для конвертации
 * - Статистику использования ID
 * 
 * @example
 * import { shortIdGenerator, toShortId, toUuid } from './shortId.js';
 * 
 * // Создание короткого ID из UUID
 * const shortId = toShortId(uuid);
 * 
 * // Получение UUID по короткому ID
 * const uuid = toUuid(shortId);
 * 
 * // Очистка маппингов при перезапуске
 * shortIdGenerator.clear();
 */

// Генератор коротких ID для уменьшения сетевого трафика
class ShortIdGenerator {
    constructor() {
        this.counter = 0;                    // Счетчик для генерации уникальных ID
        this.idMap = new Map();              // Маппинг короткого ID на полный UUID
        this.reverseMap = new Map();         // Маппинг полного UUID на короткий ID
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Символы для base-62
    }

    /**
     * Генерирует короткий ID длиной 2-4 символа
     * Использует base-62 кодировку для компактного представления
     * @returns {string} короткий ID
     */
    generateShortId() {
        this.counter++;
        let shortId = '';
        
        // Конвертируем счетчик в строку base-62
        let num = this.counter;
        do {
            shortId = this.chars[num % this.chars.length] + shortId;
            num = Math.floor(num / this.chars.length);
        } while (num > 0);
        
        // Обеспечиваем минимальную длину 2 символа
        while (shortId.length < 2) {
            shortId = 'A' + shortId;
        }
        
        return shortId;
    }

    /**
     * Создает короткий ID для заданного UUID
     * Если UUID уже имеет короткий ID, возвращает существующий
     * @param {string} uuid - полный UUID
     * @returns {string} короткий ID
     */
    createShortId(uuid) {
        if (this.reverseMap.has(uuid)) {
            return this.reverseMap.get(uuid);
        }
        
        const shortId = this.generateShortId();
        this.idMap.set(shortId, uuid);       // Сохраняем маппинг короткий ID -> UUID
        this.reverseMap.set(uuid, shortId);  // Сохраняем маппинг UUID -> короткий ID
        
        return shortId;
    }

    /**
     * Получает UUID по короткому ID
     * @param {string} shortId - короткий ID
     * @returns {string|undefined} полный UUID или undefined если не найден
     */
    getUuid(shortId) {
        return this.idMap.get(shortId);
    }

    /**
     * Получает короткий ID по UUID
     * @param {string} uuid - полный UUID
     * @returns {string|undefined} короткий ID или undefined если не найден
     */
    getShortId(uuid) {
        return this.reverseMap.get(uuid);
    }

    /**
     * Очищает все маппинги
     * Используется при перезапуске игры
     */
    clear() {
        this.counter = 0;
        this.idMap.clear();
        this.reverseMap.clear();
    }

    /**
     * Получает статистику генератора
     * @returns {Object} объект со статистикой {totalIds, counter}
     */
    getStats() {
        return {
            totalIds: this.idMap.size,       // Общее количество созданных ID
            counter: this.counter            // Текущее значение счетчика
        };
    }
}

// Глобальный экземпляр генератора коротких ID
export const shortIdGenerator = new ShortIdGenerator();

/**
 * Вспомогательная функция для конвертации UUID в короткий ID
 * @param {string} uuid - полный UUID
 * @returns {string} короткий ID
 */
export const toShortId = (uuid) => {
    return shortIdGenerator.createShortId(uuid);
};

/**
 * Вспомогательная функция для конвертации короткого ID в UUID
 * @param {string} shortId - короткий ID
 * @returns {string|undefined} полный UUID или undefined если не найден
 */
export const toUuid = (shortId) => {
    return shortIdGenerator.getUuid(shortId);
}; 