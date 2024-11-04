import { changeCanvas } from "../tools";

let div = null;
let canvas = null;
let context = null;
let observer = null;

const cleanUp = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

const run = () => {
  div = document.querySelector("#container");
  canvas = document.querySelector("#canvas");
  context = canvas.getContext("2d");
  const styleProxy = new Proxy(div.style, {
    set(target, property, value) {
      if (["width", "height", "fontSize"].includes(property)) {
        console.log(`Свойство стиля "${property}" изменено на "${value}"`);
        return Reflect.set(target, property, value);
      }
      return true;
    },
  });

  // Создаем прокси для div, заменяя style на наш styleProxy
  const divProxy = new Proxy(div, {
    get(target, property) {
      if (property === "style") {
        return styleProxy;
      }
      return Reflect.get(target, property);
    },
    set(target, property, value) {
      return Reflect.set(target, property, value);
    },
  });

  if (context && div) {
    // Создаем observer для отслеживания изменений стилей и атрибутов
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          changeCanvas({ div, canvas, context });
        }
      });
    });
    observer.observe(div, { attributes: true, attributeFilter: ["style"] });
    // Первоначальная настройка
    changeCanvas({ div, canvas, context });
  }
  return divProxy;
};

export default {
  run,
  cleanUp,
};
