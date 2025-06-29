import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "node:path";
import fastifyWebsocket from "@fastify/websocket";
import { gameLoop, startGame } from "./src/server/game.js";
import { addPlayer } from "./src/server/players.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(fastifyStatic, {
  root: join(process.cwd(), "dist"),
  prefix: "/",
});
await fastify.register(fastifyWebsocket);

fastify.register(async (fastify) => {
  fastify.get("/ws", { websocket: true }, (ws, req) => {
    let clientId = req.query.id;
    addPlayer(clientId, ws);
  });
});

startGame();

function loop() {
    const start = Date.now();
    gameLoop();
    const delay = Math.max(0, (1000 / 60) - (Date.now() - start));
    setTimeout(loop, delay);
}

loop();

fastify.listen({ port: 3001, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
