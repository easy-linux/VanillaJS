import { BOT_COUNT, FIELD_SIZE, messageTypes } from "../constants.js";
import { explodeBomb } from "./bombs.js";
import { eatFood, getFood } from "./food.js";
import { getPlayers } from "./players.js";
import { getDistance, randomPos } from "./utils.js";

const bots = new Map();

export const getBots = () => {
  return Array.from(bots.values());
};

export const createBot = () => {
  const id = crypto.randomUUID();
  const pos = randomPos();
  const bot = {
    id,
    name: `Bot ${bots.size + 1}`,
    x: pos.x,
    y: pos.y,
    vx: 0,
    vy: 0,
    size: 10,
    isBot: true,
    changeDirCooldown: 0,
  };
  bots.set(id, bot);
};

export const getBotsSnapshot = () => {
  const snapshot = [];
  const bots = getBots();

  bots.forEach((bot) => {
    let target = null;
    let minDistance = Infinity;

    for (const other of [...getPlayers(), ...getBots()]) {
      if (other.id === bot.id || other.size + 2 >= bot.size) continue;

      const distance = getDistance(other, bot)

      if (distance < minDistance) {
        minDistance = distance;
        target = other;
      }
    }

    if (!target) {
      const food = getFood();
      food.forEach((f) => {
        const distance = getDistance(f, bot);
        if (distance < minDistance) {
          minDistance = distance;
          target = f;
        }
      });
    }

    if (target) {
      const distance = getDistance(target, bot);
      const speed = 1.5;
      const dx = target.x - bot.x;
      const dy = target.y - bot.y;
      bot.vx = (dx / distance) * speed;
      bot.vy = (dy / distance) * speed;
    }

    bot.x += bot.vx;
    bot.y += bot.vy;

    if (bot.x < 0) bot.x = FIELD_SIZE;
    if (bot.x > FIELD_SIZE) bot.x = 0;
    if (bot.y < 0) bot.y = FIELD_SIZE;
    if (bot.y > FIELD_SIZE) bot.y = 0;

    eatFood(bot);
    explodeBomb(bot);

    for (const other of [...getPlayers(), ...getBots()]) {
      if (other.id === bot.id) continue;

      const distance = getDistance(other, bot);
      if (distance < bot.size && bot.size > other.size + 2) {
        bot.size += other.size * 0.5; // Increase size by 10% of the other player's size
        other.size = 10;
        const pos = randomPos();
        other.x = pos.x;
        other.y = pos.y;
      }
    }
    snapshot.push({
      id: bot.id,
      x: bot.x,
      y: bot.y,
      size: bot.size,
      name: bot.name,
      isBot: bot.isBot,
    });
  });
  return snapshot;
};

export const restartBots = () => {
  bots.clear();
  for(let i = 0; i < BOT_COUNT; i++){
    createBot()
  }
};
