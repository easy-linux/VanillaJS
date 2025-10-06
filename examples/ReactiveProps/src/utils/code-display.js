// Утилита для динамического отображения кода
// Загружает и отображает код из файлов с подсветкой синтаксиса

class CodeDisplay {
  constructor() {
    this.codeCache = new Map();
  }

  // Загружает код из файла и кэширует его
  async loadCode(filePath) {
    if (this.codeCache.has(filePath)) {
      return this.codeCache.get(filePath);
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const code = await response.text();
      this.codeCache.set(filePath, code);
      return code;
    } catch (error) {
      console.error('Error loading code file:', error);
      return `// Ошибка загрузки файла: ${filePath}\n// ${error.message}`;
    }
  }

  // Отображает код с подсветкой синтаксиса
  displayCode(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    // Показываем индикатор загрузки
    container.innerHTML = '<div class="loading">Загрузка кода...</div>';

    this.loadCode(filePath).then(code => {
      const highlightedCode = this.highlightSyntax(code);
      container.innerHTML = `<pre class="code-block">${highlightedCode}</pre>`;
    });
  }

  // Простая подсветка синтаксиса JavaScript
  highlightSyntax(code) {
    return code
      // Ключевые слова
      .replace(/\b(const|let|var|function|class|extends|constructor|get|set|return|if|else|switch|case|default|for|while|do|in|of|try|catch|finally|throw|new|delete|typeof|instanceof|void|this|super|import|export|from|as|default|null|undefined|true|false|NaN|Infinity)\b/g, 
        '<span class="code-keyword">$1</span>')
      
      // Строки
      .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
        '<span class="code-string">$1$2$1</span>')
      
      // Комментарии
      .replace(/(\/\/.*$)/gm, 
        '<span class="code-comment">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, 
        '<span class="code-comment">$1</span>')
      
      // Числа
      .replace(/\b(\d+(?:\.\d+)?)\b/g, 
        '<span class="code-number">$1</span>')
      
      // Функции
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, 
        '<span class="code-function">$1</span>(')
      
      // Методы объектов
      .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, 
        '.<span class="code-method">$1</span>(')
      
      // Свойства объектов
      .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\()/g, 
        '.<span class="code-property">$1</span>')
      
      // HTML-экранирование
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Отображает код для конкретного примера
  async displayExampleCode(exampleName) {
    const filePath = `/src/examples/${exampleName}.js`;
    await this.displayCode('codeDisplay', filePath);
  }

  // Обновляет отображение кода при изменении файла
  refreshCode(containerId, filePath) {
    this.codeCache.delete(filePath);
    this.displayCode(containerId, filePath);
  }
}

// Создаем глобальный экземпляр
window.codeDisplay = new CodeDisplay();

// Экспортируем для использования в модулях
export default CodeDisplay; 