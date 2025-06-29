import { INITIAL_FOOD_COUNT } from "../constants.js";
import { randomPos } from "./utils.js";

const food = [];

export const getFood = () => {
  return [...food];
};

export const restartFood = () => {
  food.length = 0; // Clear the food array
  for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
    food.push({
      id: crypto.randomUUID(),
      ...randomPos(),
      size: 5, // Initial size of food
    });
  }
};

export const addFood = () => {
  if (food.length < INITIAL_FOOD_COUNT * 0.9) {
    const missingFoodCount = INITIAL_FOOD_COUNT - food.length;
    for (let i = 0; i < missingFoodCount; i++) {
      food.push({
        id: crypto.randomUUID(),
        ...randomPos(),
        size: 5,
      });
    }
  }
};

export const eatFood = (player) => {
  for (let i = food.length - 1; i >= 0; i--) {
    const f = food[i];
    const dx = f.x - player.x;
    const dy = f.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < player.size) {
      player.size += 0.5;
      food.splice(i, 1);
      food.push({
        id: crypto.randomUUID(),
        ...randomPos(),
        size: 5,
      });
    }
  }
};
