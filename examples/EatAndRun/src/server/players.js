import { FIELD_SIZE, messageTypes } from "../constants.js";
import { explodeBomb } from "./bombs.js";
import { getBots } from "./bots.js";
import { eatFood } from "./food.js";
import { getDistance, randomPos } from "./utils.js";

const players = new Map();

export const addPlayer = (id, ws) => {
  const pos = randomPos();
  const player = {
    id,
    ws,
    x: pos.x,
    y: pos.y,
    vx: 0,
    vy: 0,
    size: 10, // Initial size
    name: `Player ${id}`,
  };
  players.set(id, player);
  ws.send(JSON.stringify({ type: messageTypes.INIT, id }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case messageTypes.MOVE:
        player.vx = data.vx;
        player.vy = data.vy;
        break;
      case messageTypes.SET_NAME:
        player.name = data.name;
        break;
      default:
        console.warn(`Unknown message type: ${data.type}`);
    }
  });

  ws.on("close", () => {
    players.delete(id);
  });
};

export const getPlayers = () => {
  return Array.from(players.values());
};

export const getPlayersSnapshot = () => {
  const snapshot = [];
  const players = getPlayers();
  const bots = getBots()
  players.forEach((player) => {
    player.x += player.vx;
    player.y += player.vy;

    if (player.x < 0) player.x = FIELD_SIZE;
    if (player.x > FIELD_SIZE) player.x = 0;
    if (player.y < 0) player.y = FIELD_SIZE;
    if (player.y > FIELD_SIZE) player.y = 0;

    eatFood(player);
    explodeBomb(player);

    for (const other of [...players, ...bots]) {
      if (other.id === player.id) continue;

      const distance = getDistance(other, player);
      if (distance < player.size && player.size > other.size + 2) {
        player.size += other.size * 0.5; // Increase size by 10% of the other player's size
        other.saze = 10;
        const pos = randomPos();
        other.x = pos.x;
        other.y = pos.y;
      }
    }

    snapshot.push({
      id: player.id,
      x: player.x,
      y: player.y,
      size: player.size,
      name: player.name,
    });
  });
  return snapshot;
};

export const restartPlayers = () => {
  const players = getPlayers();
  players.forEach((player) => {
    const pos = randomPos();
    player.x = pos.x;
    player.y = pos.y;
    player.size = 10; // Reset size
    player.vx = 0;
    player.vy = 0;
  });
};

export const broadcastMessage = (message) => {
  const players = getPlayers();
  players.forEach((player) => {
    if (player.ws.readyState === player.ws.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  });
};

export const broadcastGameOver = (message) => {
  const paayload = {
    type: messageTypes.GAME_OVER,
    message: message,
  };
  broadcastMessage(paayload);
};
