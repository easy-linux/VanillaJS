import Fastify from "fastify";
import fastifyStatic from '@fastify/static';
import fastifyWebSocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { join } from 'path';
import { createStream, addViewer, removeViewer, getStreams, sendToViewer, sendToStreamer } from "./streams.js";

const fastify = Fastify({ logger: true });
await fastify.register(cors, {
  origin: (origin, cb) => {
      cb(null, true)
      return
  }
});


fastify.register(fastifyStatic, {
  root: join(process.cwd(), 'dist'),
  prefix: '/',
});

fastify.register(fastifyWebSocket);

fastify.get("/streams", async (req, reply) => {
  return { streams: getStreams() };
});
fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    const { streamId, role, viewerId } = req.query;
    
    if (role === "streamer") {
      createStream(streamId, connection);
    } else if (role === "viewer") {
      addViewer(streamId, viewerId, connection);
    }

    connection.on("message", async (message) => {
      if (Buffer.isBuffer(message)) {
        const str = message.toString("utf-8");
        const data = JSON.parse(str);

        if (role === "streamer") {
          sendToViewer(streamId, message, data);
        } else if (role === "viewer") {
          sendToStreamer(streamId, message);
        }
      }
    });

    connection.on("close", () => {
      if (role === "viewer") {
        removeViewer(streamId, viewerId);
      }
    });
  });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
