import { changeCanvas } from "../tools";

let div = null;
let canvas = null;
let context = null;
let interval = null;


const cleanUp = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};

const run = () => {
  div = document.querySelector("#container");
  canvas = document.querySelector("#canvas");
  context = canvas.getContext("2d");
  if (context) {
    // Проверяем размеры div каждую секунду
    interval = setInterval(()=>{changeCanvas({div, canvas, context})}, 1000);
    changeCanvas({div, canvas, context});
  }
  return div;
};

export default {
  run,
  cleanUp,
};
