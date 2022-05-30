
const usersRoutes = require('./users-routes');
const postsRoutes = require('./posts-routes');
const commentsRoutes = require('./comments-routes');
const authRoutes = require('./auth-routes');

const addAllRoutes = (fastify) => {
    fastify.get('/', async (request, reply) => {
        return { result: 'ok' }
      });
      fastify.post('/', async (request, reply) => {
        return { result: 'ok' }
      });

    usersRoutes(fastify);
    postsRoutes(fastify);
    commentsRoutes(fastify);
    authRoutes(fastify);
};

module.exports = addAllRoutes;