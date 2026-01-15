/**
 * Реализация React-подобного движка на основе Fiber архитектуры.
 * 
 * Ключевые особенности:
 * 1. Каждый экземпляр компонента имеет свой Fiber-узел с отдельным хранилищем состояния
 * 2. Используется reconciliation для переиспользования существующих узлов между рендерами
 * 3. Состояние (хуки) хранится в Fiber-узле, а не в глобальной Map по функции компонента
 * 4. Это позволяет использовать один компонент несколько раз на странице с независимым состоянием
 * 5. Используется bailout оптимизация для избежания ненужных рендеров компонентов
 * 6. Используется Fiber-архитектура для более эффективного рендеринга
 */

import { Fiber, getCurrentFiber, pushCurrentFiber, popCurrentFiber, markFiberDirty,
    shouldBailout, commitFiberMemo } from './fiber.js';


let rootEl = null;      // Корневой DOM-элемент для рендеринга
let App = null;         // Корневой компонент приложения
let oldTree = null;     // Предыдущее виртуальное дерево для сравнения при обновлении

let rootFiber = null;   // Корневой Fiber-узел для корневого компонента

/**
 * Подготавливает Fiber-узел к рендерингу.
 * Сбрасывает индекс хуков и настраивает механизм reconciliation для дочерних элементов.
 * 
 * @param {Fiber} fiber - Fiber-узел, который будет рендериться
 */
function beginFiberRender(fiber) {
    // Сбрасываем индекс хуков - при каждом рендере хуки вызываются в том же порядке
    fiber.hookIndex = 0;

    // Подготовка reconciliation (сопоставления) дочерних элементов:
    // Сохраняем ссылку на старый список детей для переиспользования существующих узлов
    // _oldCursor будет "двигаться" по старому списку детей при обработке новых
    fiber._oldCursor = fiber.child;
    // Очищаем ссылку на детей - будем строить новое дерево заново
    fiber.child = null;
    // _wipTail - указатель на последний добавленный дочерний узел (для быстрого добавления siblings)
    fiber._wipTail = null;
}

/**
 * Связывает дочерний Fiber-узел с родительским.
 * Добавляет дочерний узел в конец списка siblings родителя.
 * 
 * @param {Fiber} parent - Родительский Fiber-узел
 * @param {Fiber} child - Дочерний Fiber-узел для добавления
 */
function linkChild(parent, child) {
    // Устанавливаем связь родитель-ребенок
    child.parent = parent;
    // Новый узел пока не имеет следующих siblings
    child.sibling = null;

    // Если у родителя еще нет детей, делаем этот узел первым ребенком
    if (!parent.child) {
        parent.child = child;
    } else {
        // Иначе добавляем в конец списка siblings (используем _wipTail для O(1) добавления)
        parent._wipTail.sibling = child;
    }

    // Обновляем указатель на последний добавленный дочерний узел
    parent._wipTail = child;
}

/**
 * Извлекает следующий дочерний узел из старого дерева для reconciliation.
 * Используется для переиспользования существующих Fiber-узлов при повторных рендерах.
 * 
 * @param {Fiber} parent - Родительский Fiber-узел
 * @returns {Fiber|null} - Следующий дочерний узел из старого дерева или null
 */
function takeOldChild(parent) {
    // Берем текущий узел из старого списка детей
    const old = parent._oldCursor;
    // Сдвигаем курсор на следующий узел (или null, если список закончился)
    parent._oldCursor = old ? old.sibling : null;
    return old;
}

/**
 * Создает виртуальный элемент (vnode) или рендерит функциональный компонент.
 * 
 * КЛЮЧЕВОЙ МОМЕНТ: Для функциональных компонентов создается или переиспользуется Fiber-узел.
 * Каждый экземпляр компонента имеет свой Fiber-узел с отдельным хранилищем состояния (хуков).
 * 
 * @param {string|Function} type - Тип элемента (строка для DOM, функция для компонента)
 * @param {Object} props - Пропсы элемента
 * @param {...any} children - Дочерние элементы
 * @returns {Object} - Виртуальный узел (vnode)
 */
export function createElement(type, props, ...children) {
    const typeEntity = type;

    // Если тип - функция, это функциональный компонент
    if (typeof typeEntity === 'function') {
        // Получаем текущий родительский Fiber-узел из контекста
        // Это позволяет правильно строить дерево Fiber-узлов
        const parent = getCurrentFiber();
        if (!parent) {
            throw new Error('Functional component rendered without parent fiber. Root must be rendered via renderApp/rootFiber.');
        }

        // Извлекаем key из пропсов (для оптимизации reconciliation)
        const key = props?.key ?? null;

        // RECONCILIATION: пытаемся переиспользовать существующий Fiber-узел
        // Берем следующий дочерний узел из старого дерева по позиции
        const old = takeOldChild(parent);
        let fiber;

        // Если нашли старый узел с тем же типом и key - переиспользуем его
        // Это сохраняет состояние (хуки) между рендерами!
        if (old && old.type === typeEntity && old.key === key) {
            fiber = old;
            // Обновляем пропсы, но сохраняем хуки и другие данные
            fiber.props = props;
            fiber.key = key;
        } else {
            // Создаем новый Fiber-узел для этого экземпляра компонента
            // КАЖДЫЙ экземпляр получает свой Fiber-узел, даже если это тот же компонент!
            fiber = new Fiber(typeEntity, props, parent, key);
        }

        // Связываем новый/переиспользованный узел с родителем в новом дереве
        linkChild(parent, fiber);

        // bail out: если ничего не изменилось — вернуть прошлый vnode
        if (fiber.memoizedVNode && shouldBailout(fiber, props)) {
            return fiber.memoizedVNode;
        }

        // Подготавливаем Fiber-узел к рендерингу (сбрасываем hookIndex, настраиваем reconciliation)
        beginFiberRender(fiber);

        // Устанавливаем этот Fiber-узел как текущий в контексте
        // Теперь хуки (useState, useMemo) будут использовать этот Fiber-узел
        pushCurrentFiber(fiber);

        // Вызываем компонент - внутри могут вызываться хуки, которые будут
        // сохранять состояние в fiber.hooks
        const vnode = typeEntity(props || {});

        // Восстанавливаем предыдущий контекст (убираем этот Fiber из стека)
        popCurrentFiber();

        // запомнить результат/состояние
        commitFiberMemo(fiber, props, vnode);

        // Возвращаем результат рендеринга компонента
        return vnode;
    }

    // Для обычных DOM-элементов просто возвращаем виртуальный узел
    return { type, props: props || {}, children };
}

/**
 * Создает виртуальный узел-фрагмент.
 * Фрагмент позволяет группировать несколько элементов без создания дополнительного DOM-узла.
 * 
 * @param {Array} children - Массив дочерних элементов
 * @returns {Object} - Виртуальный узел-фрагмент
 */
export function createFragment(children) {
    return { type: 'fragment', props: {}, children };
}

/**
 * Рендерит виртуальный узел в реальный DOM-элемент.
 * Используется при создании новых узлов или замене существующих.
 * 
 * @param {Object|string|number} vnode - Виртуальный узел для рендеринга
 * @returns {HTMLElement|Text|DocumentFragment} - Реальный DOM-элемент
 */
export const render = (vnode) => {
    // Текстовый узел - создаем текстовый DOM-узел
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }

    // Фрагмент - создаем DocumentFragment и рекурсивно рендерим детей
    if (vnode.type === 'fragment') {
        const fragment = document.createDocumentFragment();
        vnode.children.forEach(child => fragment.appendChild(render(child)));
        return fragment;
    }

    // Обычный DOM-элемент - создаем элемент и применяем пропсы
    const el = document.createElement(vnode.type);

    // Применяем все пропсы к элементу
    for (let [k, v] of Object.entries(vnode.props || {})) {
        el[k] = v;
    }

    // Рекурсивно рендерим дочерние элементы
    if (Array.isArray(vnode.children)) {
        vnode.children.forEach(child => el.appendChild(render(child)));
    }

    return el;
}

/**
 * Проверяет, изменился ли виртуальный узел по сравнению со старым.
 * Используется для определения, нужно ли заменять DOM-узел полностью или можно обновить.
 * 
 * Критерии изменения:
 * 1. Изменился тип узла (string -> number, или разные типы элементов)
 * 2. Для текстовых узлов - изменилось значение
 * 3. Для элементов - изменился тип элемента (tag name или компонент)
 * 
 * @param {Object|string|number} a - Новый узел
 * @param {Object|string|number} b - Старый узел
 * @returns {boolean} - true, если узлы различаются и требуют замены
 */
export const changed = (a, b) => {
    // Разные типы (string vs number vs object) - узлы изменились
    return typeof a !== typeof b ||
        // Для текстовых узлов - сравниваем значения
        (typeof a === 'string' && a !== b) ||
        // Для элементов - сравниваем типы (tag name или функция компонента)
        a.type !== b.type;
}

/**
 * Рекурсивно обновляет DOM на основе различий между новым и старым виртуальным деревом.
 * 
 * Алгоритм обновления:
 * 1. Сравнивает новый и старый узлы
 * 2. Если узлы одинакового типа - обновляет пропсы и рекурсивно обрабатывает детей
 * 3. Если тип изменился - заменяет узел полностью
 * 4. Если узел удален - удаляет из DOM
 * 5. Если узел добавлен - добавляет в DOM
 * 
 * @param {HTMLElement} parent - Родительский DOM-элемент
 * @param {Object|string|number} newNode - Новый виртуальный узел
 * @param {Object|string|number} oldNode - Старый виртуальный узел
 * @param {number} index - Индекс узла среди siblings
 */
export const updateElement = (parent, newNode, oldNode, index = 0) => {
    // Обработка фрагментов - обрабатываем детей напрямую
    if (oldNode && oldNode.type === 'fragment') {
        const max = Math.max(newNode?.children?.length || 0, oldNode.children.length);
        for (let i = 0; i < max; i++) {
            updateElement(parent, newNode?.children?.[i], oldNode.children[i], index + i);
        }
        return;
    }
    if (newNode && newNode.type === 'fragment') {
        const max = Math.max(newNode.children.length, oldNode?.children?.length || 0);
        for (let i = 0; i < max; i++) {
            updateElement(parent, newNode.children[i], oldNode?.children?.[i], index + i);
        }
        return;
    }

    // Обработка текстовых узлов
    if (typeof newNode === 'string' || typeof newNode === 'number') {
        if (typeof oldNode === 'string' || typeof oldNode === 'number') {
            // Оба текстовых узла - обновляем содержимое, если изменилось
            if (newNode !== oldNode) {
                parent.childNodes[index].textContent = newNode;
            }
        } else {
            // Заменяем старый узел на новый текстовый узел
            parent.replaceChild(render(newNode), parent.childNodes[index]);
        }
        return;
    }

    // Обработка обычных узлов
    if (!oldNode) {
        // Узел добавлен - создаем и добавляем в DOM
        parent.appendChild(render(newNode));
        return;
    }
    else if (!newNode) {
        // Узел удален - удаляем из DOM
        parent.removeChild(parent.childNodes[index]);
        return;
    }
    else if (changed(newNode, oldNode)) {
        // Тип узла изменился - заменяем полностью
        parent.replaceChild(render(newNode), parent.childNodes[index]);
        return;
    }
    else if (newNode.type && oldNode.type && newNode.type === oldNode.type) {
        // Узлы одного типа - сохраняем ссылку на Fiber (если есть)
        // Это позволяет сохранить состояние компонента при обновлении
        newNode.__fiber = oldNode.__fiber;
    }

    // Рекурсивно обновляем дочерние элементы
    const max = Math.max(newNode.children.length, oldNode.children.length);
    for (let i = 0; i < max; i++) {
        updateElement(
            parent.childNodes[index],
            newNode.children[i],
            oldNode.children[i],
            i
        );
    }
}

/**
 * Хук для управления состоянием компонента.
 * 
 * КЛЮЧЕВОЕ ОТЛИЧИЕ от оригинальной реализации:
 * - Состояние хранится в Fiber-узле (fiber.hooks), а не в глобальной Map
 * - Каждый экземпляр компонента имеет свой Fiber-узел с отдельным массивом хуков
 * - Это позволяет использовать один компонент несколько раз с независимым состоянием
 * 
 * @param {any} initialValue - Начальное значение состояния (может быть функцией)
 * @returns {[any, Function]} - Кортеж [текущее значение, функция обновления]
 */
export const useState = (initialValue) => {
    // Получаем текущий Fiber-узел из контекста
    // Это Fiber-узел того экземпляра компонента, который сейчас рендерится
    const fiber = getCurrentFiber();
    if (!fiber) {
        throw new Error('useState must be called inside a component');
    }

    // Получаем индекс текущего хука и увеличиваем счетчик
    // Хуки должны вызываться в одном и том же порядке при каждом рендере
    const idx = fiber.hookIndex++;

    // Инициализируем состояние только при первом рендере
    // При последующих рендерах значение уже будет в fiber.hooks[idx]
    if (fiber.hooks[idx] === undefined) {
        // Если initialValue - функция, вызываем её для ленивой инициализации
        fiber.hooks[idx] =
            typeof initialValue === 'function'
                ? initialValue()
                : initialValue;
    }

    // Функция для обновления состояния
    const setState = (value) => {
        // Обновляем значение в массиве хуков Fiber-узла
        // Если value - функция, вызываем её с текущим значением
        fiber.hooks[idx] =
            typeof value === 'function'
                ? value(fiber.hooks[idx])
                : value;

        markFiberDirty(fiber);
        // Запускаем перерендер приложения
        // Это обновит DOM на основе нового состояния
        renderApp();
    };

    // Возвращаем текущее значение и функцию обновления
    return [fiber.hooks[idx], setState];
}

/**
 * Хук для мемоизации вычислений.
 * Пересчитывает значение только если изменились зависимости.
 * 
 * @param {Function} factory - Функция, которая вычисляет значение
 * @param {Array} deps - Массив зависимостей для сравнения
 * @returns {any} - Мемоизированное значение
 */
export const useMemo = (factory, deps) => {
    // Получаем текущий Fiber-узел из контекста
    const fiber = getCurrentFiber();
    if (!fiber) {
        throw new Error('useMemo must be called inside a component');
    }

    // Получаем индекс текущего хука
    const idx = fiber.hookIndex++;

    // Получаем предыдущее значение хука (если есть)
    const prev = fiber.hooks[idx];

    // По умолчанию считаем, что зависимости изменились
    let changed = true;

    // Если есть предыдущее значение с зависимостями, сравниваем их
    if (prev && prev.deps) {
        // Проверяем, изменилась ли хотя бы одна зависимость
        changed = deps.some((d, i) => d !== prev.deps[i]);
    }

    // Если зависимости изменились или значения еще нет - пересчитываем
    if (!prev || changed) {
        // Сохраняем новое значение вместе с зависимостями для следующего сравнения
        fiber.hooks[idx] = { value: factory(), deps };
    }

    // Возвращаем мемоизированное значение (новое или старое)
    return fiber.hooks[idx].value;
}

/**
 * Рендерит приложение и обновляет DOM.
 * 
 * Процесс рендеринга:
 * 1. Создает или переиспользует корневой Fiber-узел
 * 2. Подготавливает его к reconciliation (сопоставлению старого и нового дерева)
 * 3. Вызывает корневой компонент, который строит новое виртуальное дерево
 * 4. Во время построения дерева создаются/переиспользуются Fiber-узлы для компонентов
 * 5. Обновляет реальный DOM на основе различий между старым и новым деревом
 */
export const renderApp = () => {
    // Создаем корневой Fiber-узел при первом рендере
    if (!rootFiber) {
        rootFiber = new Fiber(App, {});
    }

    // Подготавливаем корневой Fiber к повторному рендеру:
    // - Сбрасываем индекс хуков (хуки будут вызываться заново)
    // - Сохраняем ссылку на старое дерево детей для reconciliation
    // - Очищаем ссылку на детей (будем строить новое дерево)
    rootFiber.hookIndex = 0;
    rootFiber._oldCursor = rootFiber.child;
    rootFiber.child = null;
    rootFiber._wipTail = null;

    // Устанавливаем корневой Fiber как текущий в контексте
    // Теперь все createElement() будут видеть его как родителя
    pushCurrentFiber(rootFiber);

    // Вызываем корневой компонент - он строит новое виртуальное дерево
    // Внутри будут вызываться createElement() для компонентов,
    // которые создадут/переиспользуют Fiber-узлы с сохранением состояния
    const newTree = App();

    // Восстанавливаем контекст (убираем rootFiber из стека)
    popCurrentFiber();

    // Обновляем реальный DOM на основе различий между старым и новым деревом
    updateElement(rootEl, newTree, oldTree);

    // Сохраняем новое дерево как старое для следующего рендера
    oldTree = newTree;
}


/**
 * Инициализирует и запускает приложение.
 * 
 * @param {Function} AppComponent - Корневой компонент приложения
 * @param {HTMLElement} container - DOM-элемент, в который будет рендериться приложение
 */
export const start = (AppComponent, container) => {
    // Сохраняем корневой DOM-элемент и компонент приложения
    rootEl = container;
    App = AppComponent;

    // Выполняем первый рендер приложения
    // Это создаст корневой Fiber-узел и построит начальное виртуальное дерево
    renderApp();
}