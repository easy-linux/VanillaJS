let rootEl = null;
let App = null;
let oldTree = null;

let componentHooks = new Map();
let currentComponent = null;
let currentHook = 0;

export function createElement(type, props, ...children) {
    // Сохраняем тип и пропсы для обработки функциональных компонентов
    const typeEntity = type;
    const propsEntity = props;
    // Если тип - функция, вызываем её для получения дерева элементов
    if (typeof typeEntity === 'function') {
        // Устанавливаем текущий компонент для хуков
        currentComponent = typeEntity;
        // Сбрасываем индекс текущего хука
        currentHook = 0;
        // Вызываем компонент для получения его дерева элементов
        const { type, props, children } = typeEntity(propsEntity || {});
        // Сбрасываем текущий компонент после рендера
        currentComponent = null;
        // Возращаем полученный виртуаный элемент
        return { type, props: props || {}, children };
    }
    // Возвращаем обычный виртуальный элемент
    return { type, props: props || {}, children };
}

// Функция реализующая поддерку компонента-фрагмента
export function createFragment(children) {
    return { type: 'fragment', props: {}, children };
}

// Функция рендера виртуального DOM в реальный DOM
export const render = (vnode) => {
    // Текстовый узел
    if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(vnode);
    // Фрагмент
    if (vnode.type === 'fragment') {
        const fragment = document.createDocumentFragment();
        vnode.children.forEach(child => fragment.appendChild(render(child)));
        return fragment;
    }
    // Обычный узел
    const el = document.createElement(vnode.type);
    for (let [k, v] of Object.entries(vnode.props || {})) el[k] = v;
    if (Array.isArray(vnode.children)){
        vnode.children.forEach(child => el.appendChild(render(child)));
    }
    return el;
}

export const changed = (a, b) => {
    // Проверяем, изменились ли узлы
    // три критерия изменения: тип, значение для строк и чисел, тип компонента
    return typeof a !== typeof b ||
        (typeof a === 'string' && a !== b) ||
        a.type !== b.type;
}

export const updateElement = (parent, newNode, oldNode, index = 0) => {
    if (oldNode && oldNode.type === 'fragment') {
        // Обновление фрагмента если есть старый узел-фрагмент
        const max = Math.max(newNode?.children?.length || 0, oldNode.children.length);
        for (let i = 0; i < max; i++) {
            updateElement(parent, newNode?.children?.[i], oldNode.children[i], index + i);
        }
        return;
    }
    if (newNode && newNode.type === 'fragment') {
        // обновление фрагмента если есть новый узел-фрагмент
        const max = Math.max(newNode.children.length, oldNode?.children?.length || 0);
        for (let i = 0; i < max; i++) {
            updateElement(parent, newNode.children[i], oldNode?.children?.[i], index + i);
        }
        return;
    }

    if (typeof newNode === 'string' || typeof newNode === 'number') {
        // Текстовый узел
        if (typeof oldNode === 'string' || typeof oldNode === 'number') {
            // Оба текстовых узла, обновляем если нужно
            if (newNode !== oldNode) {
                parent.childNodes[index].textContent = newNode;
            }
        } else {
            // Заменяем старый узел на новый текстовый узел
            parent.replaceChild(render(newNode), parent.childNodes[index]);
        }
        return;
    }
    // Обычный узел
    if (oldNode == undefined) {
        // Добавляем новый узел
        parent.appendChild(render(newNode));
    }
    else if (newNode == undefined) {
        // Удаляем узел
        parent.removeChild(parent.childNodes[index]);
        if (oldNode.type && typeof oldNode.type === 'function') {
            // Очистка хуков компонента при удалении
            componentHooks.delete(oldNode.type);
        }
    }
    else if (changed(newNode, oldNode)) {
            // Заменяем узел
        parent.replaceChild(render(newNode), parent.childNodes[index]);
    }
    else if (newNode.type) {
        const max = Math.max(newNode.children.length, oldNode.children.length);
        for (let i = 0; i < max; i++)
            // Обновляем детей
            updateElement(parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
    }
}

export const useState = (initialValue) => {
    // Устанавливаем текущий компонент для хуков
    const currComponent = currentComponent;
    if (!currComponent) throw new Error('useState must be called inside a component');
    // Получаем все хуки для текущего компонента, если их нет - создаем пустой массив
    const hooks = componentHooks.get(currentComponent) || [];
    // Получаем индекс текущего хука
    const id = currentHook;

    // Инициализируем состояние, если его еще нет
    if (hooks[id] === undefined) hooks[id] = initialValue;
    // Функция для обновления состояния
    const setState = v => {
        if(typeof v === 'function') v = v(hooks[id]);
        hooks[id] = v;
        componentHooks.set(currComponent, hooks);
        renderApp();
    };
    // Увеличиваем индекс текущего хука
    currentHook++;
    // Сохраняем обновленные хуки для текущего компонента
    componentHooks.set(currentComponent, hooks);
    // Возвращаем текущее состояние и функцию для его обновления
    return [hooks[id], setState];
}

export const useMemo = (factory, deps) => {
    // Устанавливаем текущий компонент для хуков
    const currComponent = currentComponent;
    if (!currComponent) throw new Error('useMemo must be called inside a component');
    // Получаем все хуки для текущего компонента, если их нет - создаем пустой массив
    const hooks = componentHooks.get(currentComponent) || [];
    // Получаем индекс текущего хука
    const id = currentHook;
    // Получаем предыдущие значения хука
    const prev = hooks[id];
    // По умолчанию считаем, что значения изменились
    let hasChanged = true;
    if (prev && prev.deps) {
        // Сравниваем новые зависимости с предыдущими
        hasChanged = deps.some((dep, i) => dep !== prev.deps[i]);
    }
    // Если значений нет или они изменились, пересчитываем значение
    if (!prev || hasChanged) {
        // Вычисляем новое значение и сохраняем его вместе с зависимостями
        hooks[id] = { value: factory(), deps };
        // Сохраняем обновленные хуки для текущего компонента
        componentHooks.set(currComponent, hooks);
    }
    // Увеличиваем индекс текущего хука
    currentHook++;
    // Возвращаем вычисленное значение
    return hooks[id].value;
}

export const renderApp = () => {
    currentHook = 0;
    currentComponent = App;
    // Рендерим приложение и создаем новую версию виртуального дерева элементов
    const newTree = App();
    // Обновляем реальный DOM на основе изменений между новым и старым деревом
    updateElement(rootEl, newTree, oldTree);
    // Сохраняем новое дерево как старое для следующего рендера
    oldTree = newTree;
    // Сбрасываем текущий компонент после рендера
    currentComponent = null;
}


export const start = (AppComponent, container) => {
    // Инициализируем корневой элемент и компонент приложения
    rootEl = container;
    App = AppComponent;
    // Выполняем первый рендер приложения
    renderApp(AppComponent);
}