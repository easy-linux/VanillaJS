// EXAMPLE

const handler = {
  get: (obj, prop, receiver) => {
    if (prop === "set") {
      return function (key, value) {
        // Валидация данных
        if (typeof key !== "string") {
          throw new Error("Key must be a string!");
        }

        // Ограничение размера
        if (obj.size >= 5) {
          throw new Error("Map can not contain more than 5 elements!");
        }

        console.log(`Adding entry with key: ${key}`);
        return Reflect.get(obj, prop, receiver).call(obj, key, value);
      };
    } else if (prop === "delete") {
      return function (key) {
        console.log(`Deleting entry with key: ${key}`);
        return Reflect.get(obj, prop, receiver).call(obj, key);
      };
    }
    return Reflect.get(obj, prop, receiver);
  },
  set: (obj, prop, value, receiver) => {
    if (prop === "size") {
      // Проверяем размер Map, чтобы нельзя было изменить напрямую
      throw new Error("You can not set 'size' directly");
    }
    Reflect.set(obj, prop, value, receiver);
  },
};

export default function code1() {
  const map = new Map();
  const proxyMap = new Proxy(map, handler);

  proxyMap.set("name", "John");
  proxyMap.set("age", "40");
  proxyMap.set("city", "Nairoby");

  try {
    proxyMap.set(123, "Invalid key");
  } catch (e) {
    console.log('ERROR =>', e.message);
  }
  proxyMap.set("job", "Designer");
  proxyMap.set("country", "Kenia");

  try {
    proxyMap.set("extra", "Extra data");
  } catch (e) {
    console.log('ERROR =>', e.message);
  }

  proxyMap.delete("country");

  try {
    proxyMap.size = 10;
  } catch (e) {
    console.log('ERROR =>', e.message);
  }

  console.log(proxyMap);
}
