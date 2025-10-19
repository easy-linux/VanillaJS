import { createElement } from './mini-react';

/**
 * Тегированный шаблонный литерал для простого JSX-подобного синтаксиса.
 * Позволяет писать:
 *
 * html`<div id="root"><h1>${title}</h1><${Button} text="Click" /></div>`
 */
export const html = (strings, ...values) => {
    // 1️⃣ Формируем промежуточную строку с плейсхолдерами
    let result = '';
    for (let i = 0; i < strings.length; i++) {
        result += strings[i];
        if (i < values.length) result += `___VAL_${i}___`;
    }

    // 2️⃣ Парсим атрибуты
    const parseProps = (attrs, isNative) => {
        const props = {};
        const attrRegex = /([a-zA-Z0-9_$\-:]+)\s*=\s*(?:"([^"]*)"|___VAL_(\d+)___)/g;
        let match;
        while ((match = attrRegex.exec(attrs))) {
            let [, key, strVal, exprIdx] = match;
            // Нрмализация имени для событий в нативных элементах (onClick -> onclick)
            if (isNative && /^on[A-Z]/.test(key)) key = key.toLowerCase();
            // Определяем значение атрибута
            if (exprIdx !== undefined) {
                props[key] = values[Number(exprIdx)]; // достаем функцию onClick
            } else {
                // если строковое значение, оставляем как есть
                props[key] = strVal;
            }
        }
        return props;
    };

    // 3️⃣ Рекурсивный парсер
    const parse = (str) => {
        const tagRegex = /^<([A-Za-z0-9_$\-]+|___VAL_\d+___)([^>]*)>([\s\S]*?)<\/\1>$/;
        const selfClosingTagRegex = /^<([A-Za-z0-9_$\-]+|___VAL_\d+___)([^>]*)\/>$/;
        const valRegex = /___VAL_(\d+)___/g;

        // само-закрытые теги <tag ... />
        let match = selfClosingTagRegex.exec(str);
        if (match) {
            let [, type, attrs] = match;
            const valTypeMatch = /^___VAL_(\d+)___$/.exec(type);
            if (valTypeMatch) type = values[Number(valTypeMatch[1])];
            const props = parseProps(attrs, typeof type === 'string');
            return createElement(type, props);
        }

        // парные теги: <tag>...</tag>
        match = tagRegex.exec(str);
        if (match) {
            let [, type, attrs, inner] = match;
            // inner - внутреннее содержимое между тегами
            // определяем тип (строка или компонент)
            const valTypeMatch = /^___VAL_(\d+)___$/.exec(type);
            // если тип - плейсхолдер, достаем реальный тип из values
            if (valTypeMatch) type = values[Number(valTypeMatch[1])];

            // парсим атрибуты
            const props = parseProps(attrs, typeof type === 'string');
            
            // парсим детей (вложенные теги или текст)
            const children = [];
            const childRegex = /(<[^>]+>[\s\S]*?<\/[^>]+>|<[^>]+\/>)/g;
            let lastIndex = 0;
            let childMatch;
            // перебираем все вложенные теги
            while ((childMatch = childRegex.exec(inner))) {
                // текст перед тегом
                const beforeText = inner.slice(lastIndex, childMatch.index);
                if (beforeText.trim()) {
                    // добавляем текстового ребенка, заменяя плейсхолдеры
                    children.push(beforeText.replace(valRegex, (_, idx) => values[idx]));
                }
                // парсим вложенный тег рекурсивно
                children.push(parse(childMatch[0]));
                // обновляем lastIndex
                lastIndex = childRegex.lastIndex;
            }
            // текст после последнего тега
            const afterText = inner.slice(lastIndex);
            // если остался текст, добавляем его
            if (afterText.trim()) {
                // добавляем текстового ребенка, заменяя плейсхолдеры
                children.push(afterText.replace(valRegex, (_, idx) => values[idx]));
            }

            return createElement(type, props, ...children);
        }

        // простой текст
        return str.replace(valRegex, (_, idx) => values[idx]);
    };

    // 4️⃣ Запуск парсера
    return parse(result.trim());
};
