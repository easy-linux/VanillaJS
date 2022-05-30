const fp = require("fastify-plugin")

module.exports = fp(async function(fastify, opts) {
  fastify.register(require("@fastify/jwt"), {
    secret: "supersecret"
  });

  fastify.decorate("authenticate", async function(request, reply, done) {
    try {
      await request.jwtVerify();
      done();
    } catch (err) {
      reply.send(err);      
    }
  });

  fastify.decorate("isAdmin", async function(request, reply, done) {
    try {
      const decodedToken = await request.jwtVerify();
      if(decodedToken['user_admin']){
        done();
      } else {
        fastify.OnlyAdmin(request, reply);
      }
    } catch (err) {
      reply.send(err);      
    }
  });
})
