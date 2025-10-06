В обычном JavaScript есть несколько способов создания реактивных свойств, которые автоматически обновляют зависимые значения или выполняют действия при изменении:

## 1. Использование геттеров и сеттеров

Самый простой способ - определить геттеры и сеттеры через `Object.defineProperty()` или в классах:

```javascript
// Через Object.defineProperty
let obj = {};
let _value = 0;
let listeners = [];

Object.defineProperty(obj, 'value', {
  get() {
    return _value;
  },
  set(newValue) {
    _value = newValue;
    listeners.forEach(listener => listener(newValue));
  }
});

// Добавляем слушателей
obj.subscribe = (callback) => listeners.push(callback);

obj.subscribe(value => console.log('Значение изменилось:', value));
obj.value = 42; // Выведет: "Значение изменилось: 42"
```

## 2. Proxy для более гибкой реактивности

Proxy позволяет перехватывать любые операции с объектом:

```javascript
function createReactive(target, callback) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;
      callback(prop, value, oldValue);
      return true;
    }
  });
}

const data = createReactive(
  { name: 'John', age: 30 },
  (prop, newValue, oldValue) => {
    console.log(`${prop} изменилось с ${oldValue} на ${newValue}`);
  }
);

data.name = 'Jane'; // Выведет: "name изменилось с John на Jane"
```

## 3. Простая система подписок

Можно создать класс для управления реактивными значениями:

```javascript
class Reactive {
  constructor(initialValue) {
    this._value = initialValue;
    this._subscribers = [];
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      this._notify();
    }
  }

  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index > -1) this._subscribers.splice(index, 1);
    };
  }

  _notify() {
    this._subscribers.forEach(callback => callback(this._value));
  }
}

// Использование
const counter = new Reactive(0);
const unsubscribe = counter.subscribe(value => 
  document.getElementById('display').textContent = value
);

counter.value = 5; // Автоматически обновит DOM
```

## 4. Вычисляемые свойства

Для создания зависимых значений, которые пересчитываются автоматически:

```javascript
class ComputedReactive extends Reactive {
  constructor(computeFn, dependencies = []) {
    super(computeFn());
    this._computeFn = computeFn;
    this._dependencies = dependencies;
    
    // Подписываемся на изменения зависимостей
    dependencies.forEach(dep => {
      dep.subscribe(() => {
        this.value = this._computeFn();
      });
    });
  }
}

// Использование
const firstName = new Reactive('John');
const lastName = new Reactive('Doe');

const fullName = new ComputedReactive(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

fullName.subscribe(name => console.log('Полное имя:', name));

firstName.value = 'Jane'; // Выведет: "Полное имя: Jane Doe"
```

## 5. Использование MutationObserver для DOM

Для отслеживания изменений в DOM:

```javascript
function observeElement(element, callback) {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => callback(mutation));
  });
  
  observer.observe(element, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  });
  
  return observer;
}
```

Эти подходы позволяют создавать реактивные системы различной сложности - от простых наблюдаемых значений до сложных систем с зависимостями, похожих на те, что используются в современных фреймворках типа Vue.js или MobX.