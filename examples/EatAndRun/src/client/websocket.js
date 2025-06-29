import { messageTypes } from "../constants";

const userId = crypto.randomUUID();
let ws;

export const initWS = ({ playerName, onInit, onUpdate, onClose, onGameOver }) => {
  const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  ws = new WebSocket(`${wsProtocol}${window.location.host}/ws?id=${userId}`);
  // ws = new WebSocket(`${wsProtocol}localhost:3000/ws?id=${userId}`);

  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({ type: messageTypes.SET_NAME, name: playerName }));
  });

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case messageTypes.INIT:
        if (onInit) {
          onInit(msg.id);
        }
        break;
      case messageTypes.GAME_UPDATE:
        if (onUpdate) {
          onUpdate(msg);
        }
        break;
      case messageTypes.GAME_OVER:
        if (onGameOver) {
          onGameOver(msg);
        }
        break;
    }
  });

  ws.addEventListener("close", () => {
    if (onClose) {
      onClose();
    }
  });
};

export const sendMessage = (message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    console.warn("WebSocket is not open. Message not sent:", message);
  }
};
