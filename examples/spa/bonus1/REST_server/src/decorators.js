module.exports = function(fastify){
    fastify.decorate('BadRequest', (request, reply, message) => {
        reply.code(400).type('application/json').send(message)
    });
    fastify.decorate('LoginError', (request, reply) => {
        reply.code(401).type('application/json').send({message: 'Unauthorized Error'})
    });
    fastify.decorate('OnlyAdmin', (request, reply) => {
        reply.code(403).type('application/json').send('You have no permission to do it')
    });
    fastify.decorate('notFound', (request, reply) => {
        reply.code(404).type('application/json').send('Not Found')
    });

    fastify.decorate("getTokenDecoded", function(request, reply) {
        try {
            const Auth = request.headers["authorization"];
            if (Auth) {
              const parsed = Auth.split(" ");
              const decodedToken = fastify.jwt.decode(parsed[1]);
              return decodedToken;
            }
        } catch (err) {
          return null;    
        }
        return null;
      })

};