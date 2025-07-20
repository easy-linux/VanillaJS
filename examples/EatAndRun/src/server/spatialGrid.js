/**
 * @module Server/SpatialGrid
 * @category Server
 * @description Модуль пространственной сетки для оптимизации поиска объектов
 * 
 * Этот модуль содержит:
 * - Класс SpatialGrid для разделения игрового поля на ячейки
 * - Быстрый поиск объектов в заданной области
 * - Добавление и удаление объектов из сетки
 * - Обновление позиций объектов в сетке
 * - Вспомогательные функции для работы с сеткой
 * 
 * @example
 * import { spatialGrid, getNearbyEntities, updateEntityPosition } from './spatialGrid.js';
 * 
 * // Добавление объекта в сетку
 * spatialGrid.addEntity(entity);
 * 
 * // Поиск ближайших объектов
 * const nearby = getNearbyEntities(x, y, radius);
 * 
 * // Обновление позиции объекта
 * updateEntityPosition(entity, oldX, oldY);
 */

import { FIELD_SIZE } from "../constants.js";

// Размер ячейки пространственной сетки
const GRID_SIZE = 200;
// Количество столбцов и строк в сетке
const GRID_COLS = Math.ceil(FIELD_SIZE / GRID_SIZE);
const GRID_ROWS = Math.ceil(FIELD_SIZE / GRID_SIZE);

/**
 * Пространственная сетка для оптимизации поиска ближайших объектов
 * Разделяет игровое поле на ячейки для быстрого поиска объектов в заданной области
 */
class SpatialGrid {
    constructor() {
        // Map для хранения ячеек сетки, где ключ - координаты ячейки, значение - Set объектов
        this.grid = new Map();
    }

    /**
     * Получает ключ ячейки сетки из координат объекта
     * @param {number} x - X координата объекта
     * @param {number} y - Y координата объекта
     * @returns {string} ключ ячейки в формате "столбец,строка"
     */
    getCellKey(x, y) {
        const col = Math.floor(x / GRID_SIZE); // Вычисляем номер столбца
        const row = Math.floor(y / GRID_SIZE); // Вычисляем номер строки
        return `${col},${row}`;
    }

    /**
     * Получает все соседние ячейки для заданной позиции
     * @param {number} x - X координата центральной позиции
     * @param {number} y - Y координата центральной позиции
     * @param {number} radius - Радиус поиска (количество ячеек вокруг)
     * @returns {Array} массив ключей соседних ячеек
     */
    getNeighborCells(x, y, radius = 1) {
        const centerCol = Math.floor(x / GRID_SIZE); // Центральный столбец
        const centerRow = Math.floor(y / GRID_SIZE); // Центральная строка
        const cells = [];

        // Проходим по всем ячейкам в радиусе
        for (let col = Math.max(0, centerCol - radius); col <= Math.min(GRID_COLS - 1, centerCol + radius); col++) {
            for (let row = Math.max(0, centerRow - radius); row <= Math.min(GRID_ROWS - 1, centerRow + radius); row++) {
                cells.push(`${col},${row}`);
            }
        }

        return cells;
    }

    /**
     * Добавляет объект в пространственную сетку
     * @param {Object} entity - объект для добавления (должен иметь x, y координаты)
     */
    addEntity(entity) {
        const cellKey = this.getCellKey(entity.x, entity.y);
        // Создаем новую ячейку если её нет
        if (!this.grid.has(cellKey)) {
            this.grid.set(cellKey, new Set());
        }
        this.grid.get(cellKey).add(entity);
    }

    /**
     * Удаляет объект из пространственной сетки
     * @param {Object} entity - объект для удаления
     */
    removeEntity(entity) {
        const cellKey = this.getCellKey(entity.x, entity.y);
        const cell = this.grid.get(cellKey);
        if (cell) {
            cell.delete(entity);
            // Удаляем пустую ячейку для экономии памяти
            if (cell.size === 0) {
                this.grid.delete(cellKey);
            }
        }
    }

    /**
     * Обновляет позицию объекта в сетке
     * Эффективно перемещает объект между ячейками если он изменил позицию
     * @param {Object} entity - объект для обновления
     * @param {number} oldX - старая X координата
     * @param {number} oldY - старая Y координата
     */
    updateEntity(entity, oldX, oldY) {
        const oldCellKey = this.getCellKey(oldX, oldY);
        const newCellKey = this.getCellKey(entity.x, entity.y);

        // Если объект переместился в другую ячейку
        if (oldCellKey !== newCellKey) {
            // Удаляем из старой ячейки
            const oldCell = this.grid.get(oldCellKey);
            if (oldCell) {
                oldCell.delete(entity);
                if (oldCell.size === 0) {
                    this.grid.delete(oldCellKey);
                }
            }

            // Добавляем в новую ячейку
            this.addEntity(entity);
        }
    }

    /**
     * Получает все объекты вблизи заданной позиции
     * Используется для оптимизации поиска объектов для столкновений
     * @param {number} x - X координата центра поиска
     * @param {number} y - Y координата центра поиска
     * @param {number} radius - Радиус поиска в ячейках
     * @returns {Array} массив объектов в заданной области
     */
    getNearbyEntities(x, y, radius = 1) {
        const cellKeys = this.getNeighborCells(x, y, radius);
        const entities = new Set(); // Используем Set для исключения дубликатов

        // Собираем все объекты из соседних ячеек
        cellKeys.forEach(cellKey => {
            const cell = this.grid.get(cellKey);
            if (cell) {
                cell.forEach(entity => entities.add(entity));
            }
        });

        return Array.from(entities);
    }

    /**
     * Очищает всю пространственную сетку
     * Используется при перезапуске игры
     */
    clear() {
        console.log('SpatialGrid: Очищаем всю сетку');
        this.grid.clear();
    }

    /**
     * Получает все объекты в сетке
     * @returns {Array} массив всех объектов в сетке
     */
    getAllEntities() {
        const entities = [];
        this.grid.forEach(cell => {
            cell.forEach(entity => entities.push(entity));
        });
        return entities;
    }
}

// Глобальный экземпляр пространственной сетки
export const spatialGrid = new SpatialGrid();

/**
 * Вспомогательная функция для получения ближайших объектов
 * Упрощает доступ к пространственной сетке
 * @param {number} x - X координата центра поиска
 * @param {number} y - Y координата центра поиска
 * @param {number} radius - Радиус поиска в ячейках
 * @returns {Array} массив объектов в заданной области
 */
export const getNearbyEntities = (x, y, radius = 1) => {
    return spatialGrid.getNearbyEntities(x, y, radius);
};

/**
 * Вспомогательная функция для обновления позиции объекта
 * Упрощает доступ к пространственной сетке
 * @param {Object} entity - объект для обновления
 * @param {number} oldX - старая X координата
 * @param {number} oldY - старая Y координата
 */
export const updateEntityPosition = (entity, oldX, oldY) => {
    spatialGrid.updateEntity(entity, oldX, oldY);
}; 