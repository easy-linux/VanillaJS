export class Reactive {
  constructor(initialValue) {
    this._value = initialValue;
    this._subscribers = [];
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (this._value !== newValue) {
        const oldValue = this._value;
      this._value = newValue;
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
    // массив функций отписки
    this._unsubscribers = [];
    
    // Подписываемся на изменения зависимостей
    dependencies.forEach(dep => {
      const unsubscribe = dep.subscribe(() => {
        this.value = this._computeFn();
      });
      this._unsubscribers.push(unsubscribe);
    });
  }
  
  destroy() {
    // вызываем все отписки
    this._unsubscribers.forEach(unsub => unsub());
    this._unsubscribers = [];
  }
}