import { createElement } from './mini-react';

/**
 * Тегированный шаблонный литерал для простого JSX-подобного синтаксиса.
 * Позволяет писать:
 *
 * html`<div id="root"><h1>${title}</h1><${Button} text="Click" /></div>`
 * 
 * Алгоритм работы:
 * 1. Заменяет все вставки ${...} на плейсхолдеры ___VAL_N___
 * 2. Парсит получившуюся строку как HTML
 * 3. Восстанавливает реальные значения из массива values по индексам
 */
export const html = (strings, ...values) => {
    // 1️⃣ Формируем промежуточную строку с плейсхолдерами
    // Заменяем все JavaScript-выражения ${...} на уникальные маркеры ___VAL_0___, ___VAL_1___ и т.д.
    // Это нужно, чтобы парсер мог корректно обработать HTML-структуру,
    // не путая JavaScript-выражения с HTML-атрибутами или текстом
    let result = '';
    const valRegex = /___VAL_(\d+)___/g; // Регулярка для поиска плейсхолдеров
    for (let i = 0; i < strings.length; i++) {
        result += strings[i]; // Добавляем строковую часть шаблона
        if (i < values.length) {
            // Заменяем JavaScript-выражение на плейсхолдер с индексом
            result += `___VAL_${i}___`;
        }
    }

    /**
     * Парсит дочерние элементы из внутреннего содержимого тега.
     * Обрабатывает смешанное содержимое: текст, теги, само-закрытые теги.
     * 
     * Алгоритм:
     * 1. Проходим по строке символ за символом
     * 2. Накапливаем текст до встречи с '<'
     * 3. При встрече '<' обрабатываем тег (само-закрытый или парный)
     * 4. Для парных тегов отслеживаем глубину вложенности
     * 
     * @param {string} inner - Внутреннее содержимое тега
     * @returns {Array} - Массив дочерних элементов (текст, элементы, компоненты)
     */
    const parseChildren = (inner) => {
        const children = [];
        let i = 0; // Индекс текущей позиции в строке
        let textBuffer = ''; // Буфер для накопления текста между тегами
      
        /**
         * Сохраняет накопленный текст как дочерний элемент.
         * Заменяет плейсхолдеры на реальные значения из массива values.
         */
        const flushText = () => {
          if (textBuffer.trim()) {
            // Заменяем плейсхолдеры ___VAL_N___ на реальные значения
            children.push(
              textBuffer.replace(valRegex, (_, idx) => values[idx])
            );
          }
          textBuffer = ''; // Очищаем буфер
        };
      
        // Проходим по всей строке символов
        while (i < inner.length) {
          // Если это не начало тега - накапливаем текст
          if (inner[i] !== '<') {
            textBuffer += inner[i++];
            continue;
          }
      
          // Встретили '<' - сохраняем накопленный текст
          flushText();
      
          // Проверяем, не само-закрытый ли это тег <tag />
          if (inner.slice(i).match(/^<[^>]+\/>/)) {
            // Находим конец само-закрытого тега
            const end = inner.indexOf('>', i) + 1;
            const tagStr = inner.slice(i, end);
            // Рекурсивно парсим тег и добавляем в children
            children.push(parse(tagStr));
            i = end; // Перемещаемся за тег
            continue;
          }
      
          // Это парный тег <tag>...</tag>
          // Нужно найти соответствующий закрывающий тег, учитывая вложенность
          let depth = 0; // Глубина вложенности тегов
          let start = i; // Начало открывающего тега
      
          // Ищем закрывающий тег, отслеживая вложенность
          while (i < inner.length) {
            // Встретили открывающий тег (не само-закрытый и не закрывающий)
            if (
              inner[i] === '<' &&
              inner[i + 1] !== '/' &&
              !inner.slice(i).match(/^<[^>]+\/>/)
            ) {
              depth++; // Увеличиваем глубину вложенности
            }
      
            // Встретили закрывающий тег </tag>
            if (inner[i] === '<' && inner[i + 1] === '/') {
              depth--; // Уменьшаем глубину вложенности
            }
      
            i++;
      
            // Если глубина вернулась к 0 и мы на закрывающей скобке - нашли конец тега
            if (depth === 0 && inner[i - 1] === '>') {
              break;
            }
          }
      
          // Извлекаем полный тег (открывающий + содержимое + закрывающий)
          const tagStr = inner.slice(start, i);
          // Рекурсивно парсим тег и добавляем в children
          children.push(parse(tagStr));
        }
      
        // Сохраняем оставшийся текст после последнего тега
        flushText();
        return children;
      };

    /**
     * Парсит атрибуты тега из строки атрибутов.
     * 
     * Поддерживает два типа значений:
     * 1. Строковые: key="value"
     * 2. JavaScript-выражения: key=${expression} (заменены на ___VAL_N___)
     * 
     * Для нативных DOM-элементов нормализует имена событий (onClick -> onclick).
     * 
     * @param {string} attrs - Строка с атрибутами (например: 'id="root" onClick=${handler}')
     * @param {boolean} isNative - true, если это нативный DOM-элемент (не компонент)
     * @returns {Object} - Объект с пропсами
     */
    const parseProps = (attrs, isNative) => {
        const props = {};
        // Регулярка для поиска атрибутов:
        // - Имя атрибута: [a-zA-Z0-9_$\-:]+ (буквы, цифры, _, $, -, :)
        // - Значение: либо строка в кавычках "value", либо плейсхолдер ___VAL_N___
        const attrRegex = /([a-zA-Z0-9_$\-:]+)\s*=\s*(?:"([^"]*)"|___VAL_(\d+)___)/g;
        let match;
        
        while ((match = attrRegex.exec(attrs))) {
            let [, key, strVal, exprIdx] = match;
            
            // Нормализация имени для событий в нативных элементах
            // React использует onClick, но DOM требует onclick (в нижнем регистре)
            if (isNative && /^on[A-Z]/.test(key)) {
                key = key.toLowerCase();
            }
            
            // Определяем значение атрибута
            if (exprIdx !== undefined) {
                // Это JavaScript-выражение - достаем реальное значение из массива values
                // Например: onClick=${handler} -> props.onClick = handler (функция)
                props[key] = values[Number(exprIdx)];
            } else {
                // Это строковое значение - оставляем как есть
                // Например: id="root" -> props.id = "root"
                props[key] = strVal;
            }
        }
        return props;
    };

    /**
     * Рекурсивный парсер HTML-подобной строки.
     * 
     * Обрабатывает три типа узлов:
     * 1. Само-закрытые теги: <tag />
     * 2. Парные теги: <tag>...</tag>
     * 3. Текстовые узлы: простой текст
     * 
     * Поддерживает компоненты через плейсхолдеры: <${Component} />
     * 
     * @param {string} str - Строка для парсинга (может быть тег или текст)
     * @returns {Object|string} - Виртуальный узел или текст
     */
    const parse = (str) => {
        // Регулярка для парных тегов: <tag attrs>content</tag>
        // Группы: 1 - имя тега, 2 - атрибуты, 3 - содержимое
        const tagRegex = /^<([A-Za-z0-9_$\-]+|___VAL_\d+___)([^>]*)>([\s\S]*?)<\/\1>$/;
        
        // Регулярка для само-закрытых тегов: <tag attrs />
        // Группы: 1 - имя тега, 2 - атрибуты
        const selfClosingTagRegex = /^<([A-Za-z0-9_$\-]+|___VAL_\d+___)([^>]*)\/>$/;

        // 1. Проверяем, не само-закрытый ли это тег <tag ... />
        let match = selfClosingTagRegex.exec(str);
        if (match) {
            let [, type, attrs] = match;
            
            // Проверяем, не плейсхолдер ли это для компонента <${Component} />
            const valTypeMatch = /^___VAL_(\d+)___$/.exec(type);
            if (valTypeMatch) {
                // Это компонент - достаем реальную функцию компонента из values
                type = values[Number(valTypeMatch[1])];
            }
            
            // Парсим атрибуты
            // isNative = true только для строковых типов (DOM-элементы)
            const props = parseProps(attrs, typeof type === 'string');
            
            // Создаем элемент без детей (само-закрытый тег)
            return createElement(type, props);
        }

        // 2. Проверяем, не парный ли это тег <tag>...</tag>
        match = tagRegex.exec(str);
        if (match) {
            let [, type, attrs, inner] = match;
            // inner - внутреннее содержимое между открывающим и закрывающим тегами
            
            // Проверяем, не плейсхолдер ли это для компонента <${Component}>
            const valTypeMatch = /^___VAL_(\d+)___$/.exec(type);
            if (valTypeMatch) {
                // Это компонент - достаем реальную функцию компонента из values
                type = values[Number(valTypeMatch[1])];
            }

            // Парсим атрибуты
            const props = parseProps(attrs, typeof type === 'string');

            // Парсим дочерние элементы (вложенные теги, компоненты, текст)
            // Используем функцию parseChildren для корректной обработки смешанного содержимого
            const children = parseChildren(inner);

            // Создаем элемент с детьми
            return createElement(type, props, ...children);
        }

        // 3. Это простой текст (не тег)
        // Заменяем плейсхолдеры на реальные значения
        return str.replace(valRegex, (_, idx) => values[idx]);
    };

    // 4️⃣ Запускаем парсер на обработанной строке
    // Убираем лишние пробелы в начале и конце, затем парсим
    // Результат - виртуальный узел (vnode), который можно использовать в createElement
    return parse(result.trim());
};
