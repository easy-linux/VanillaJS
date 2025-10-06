// Функция для создания реактивного объекта с Proxy
export  function createReactive(target, callback) {
  return new Proxy(target, {
    // Перехватываем установку свойств
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;
      // Вызываем callback с информацией об изменении
      callback({prop, value, oldValue, operation: 'set'}, obj);
      return true;
    },
    
    // Перехватываем удаление свойств
    deleteProperty(obj, prop) {
      const oldValue = obj[prop];
      const result = delete obj[prop];
      if (result) {
        callback({prop, undefined, oldValue, operation:'delete'}, obj);
      }
      return result;
    }
  });
}