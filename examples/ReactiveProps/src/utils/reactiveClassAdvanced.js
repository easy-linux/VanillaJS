export class Reactive {
  constructor(initialValue) {
    this._value = this._makeReactive(initialValue);
    this._subscribers = [];
  }

  _makeReactive(value) {
    if (Array.isArray(value)) {
      const handler = {
        set: (target, prop, newValue) => {
          const oldValue = [...target]; // копируем старое значение
          const result = Reflect.set(target, prop, newValue);
          this._notify({ oldValue, newValue: target });
          return result;
        }
      };
      return new Proxy(value, handler);
    }

    // Можно расширить поддержку для объектов и других типов при желании
    return value;
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (this._value !== newValue) {
        const oldValue = this._value;
      this._value = this._makeReactive(newValue);
      this._notify({oldValue, newValue});
    }
  }

  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  _notify({oldValue, newValue}) {
    this._subscribers.forEach(callback => callback({oldValue, newValue}));
  }
}

// Класс для вычисляемых свойств
export class ComputedReactive extends Reactive {
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