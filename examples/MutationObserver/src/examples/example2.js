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
  if (context && div) {
    // Создаем observer для отслеживания изменений стилей и атрибутов
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          changeCanvas({div, canvas, context});
        }
      });
    });
    observer.observe(div, { attributes: true });
    // Первоначальная настройка
    changeCanvas({div, canvas, context});
  }
  return div;
};

export default {
  run,
  cleanUp,
};

