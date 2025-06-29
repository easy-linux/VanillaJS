import { INITIAL_BOMBS_COUNT } from "../constants.js";
import { randomPos } from "./utils.js";

const bombs = [];

export const getBombs = () => {
  return [...bombs];
};

export const restartBombs = () => {
  bombs.length = 0; // Clear the bombs array
  for (let i = 0; i < INITIAL_BOMBS_COUNT; i++) {
    bombs.push({
      id: crypto.randomUUID(),
      ...randomPos(),
      size: 5, // Initial size of bombs
    });
  }
};

export const addBomb = () => {
  if (bombs.length < INITIAL_BOMBS_COUNT * 0.9) {
    const missingBombsCount = INITIAL_BOMBS_COUNT - bombs.length;
    for (let i = 0; i < missingBombsCount; i++) {
      bombs.push({
        id: crypto.randomUUID(),
        ...randomPos(),
        size: 5,
      });
    }
  }
};

export const explodeBomb = (player) => {
  for (let i = bombs.length - 1; i >= 0; i--) {
    const f = bombs[i];
    const dx = f.x - player.x;
    const dy = f.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < player.size) {
      player.size = Math.max(10, player.size * 0.5);  
      bombs.splice(i, 1);
      bombs.push({
        id: crypto.randomUUID(),
        ...randomPos(),
        size: 5,
      });
    }
  }
};
