import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { addStream } from "./streams.js";

const fastify = Fastify({ logger: true});
await fastify.register(fastifyWebsocket);

fastify.register(async (fastify) => {
    fastify.get('/ws', {websocket: true}, (socket, req) => {
        let clientStreamId = req.query.id;
        addStream(clientStreamId, socket);
    })
});

fastify.listen({port: 3001, host: '0.0.0.0'}, (err) => {
    if(err){
        fastify.log.error(err)
        process.exit(1);
    }
})