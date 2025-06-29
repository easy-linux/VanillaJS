import { messageTypes } from "../constants";
import { game } from "./game";
import { sendMessage } from "./websocket";

let mouseX = game.canvas.width / 2;
let mouseY = game.canvas.height / 2;
let useMouse = true;
let intervalId = null;

const onMouseMove = (e) => {
  const rect = game.canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
};

const bindMouseEvents = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.addEventListener("mousemove", onMouseMove);
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    const dx = mouseX - game.canvas.width / 2;
    const dy = mouseY - game.canvas.height / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let vx = 0;
    let vy = 0;
    const speed = 2;

    if (dist > 10) {
      vx = (dx / dist) * speed;
      vy = (dy / dist) * speed;
    }

    sendMessage(
      JSON.stringify({
        type: messageTypes.MOVE,
        vx,
        vy,
      })
    );
  }, 100);
};

const unbindMouseEvents = () => {
  window.removeEventListener("mousemove", onMouseMove);
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const mouseCheckbox = document.querySelector(".checkbox-mouse");

mouseCheckbox.addEventListener("change", (e) => {
  useMouse = e.target.checked;
  if (useMouse) {
    bindMouseEvents();
  } else {
    unbindMouseEvents();
  }
});

if (useMouse) {
  bindMouseEvents();
} else {
  unbindMouseEvents();
}
