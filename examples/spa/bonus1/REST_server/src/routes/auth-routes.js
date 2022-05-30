const authHandlers = require("../handlers/auth");

const addRoutes = fastify => {
 
  fastify.post(
    "/login",
    {
      schema: {
        description: "Log in into the system",
        tags: ['auth'],
        summary: "Log in into the system",
        params: {},
        body: {
          type: "object",
          properties: {
            login: {
              type: "string",
              description: `user's email`
            },
            password: {
              type: "string",
              description: "user password"
            }
          }
        },
        response: {
          200: {
            description: "Successful loggin",
            type: "object",
            properties: {
              token: { type: "string" }
            }
          }
        },
        security: []
      }
    },
    authHandlers.login(fastify)
  );

  
};

module.exports = addRoutes;
