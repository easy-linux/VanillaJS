const user = require('./schemas/user')
const querystrings = require('./schemas/querystrings')
const pagination = require('./schemas/pagination')
const usersHandlers = require("../handlers/users");

const addRoutes = fastify => {
  const tags = [{ name: "users", description: "  -  Users related end-points" }];

  fastify.get(
    "/users",
    {
      preValidation: (request, reply, done) => {
        fastify.authenticate(request, reply, done);
      },
      schema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Users",
        "description": "Get users list with pagination",
        "tags": ['user'],
        "summary": "Get users list",
        "querystring": {$ref: 'queryPagination#'},
        "response": {
          "200": {
            "description": "Successful responce",
            "type": "object",
            "properties": {
              "results": {
                "type": "array",
                "items": {$ref: 'user#'},
              },
              "pagination": {$ref: 'pagination#'}

            }

          }
        },
        security: [
          {
            apiKey: []
          }
        ]
      },
    },
    usersHandlers.getUsers(fastify)
  );

  fastify.get(
    "/user/:userId",
    {
      preValidation: (request, reply, done) => {
        fastify.authenticate(request, reply, done);
      },
      schema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Users",
        "description": "Get user by userId",
        "tags": ['user'],
        "summary": "Get single user",
        "params": {
          type: "object",
          properties: {
            userId: {
              type: 'string',
              format: "uuid",
              description: "User id",
            },
          },
          required: ['userId']
        },
        "response": {
          "200": {
            "description": "Successful responce",
            ...user

          }
        },
        security: [
          {
            apiKey: []
          }
        ]
      },
    },
    usersHandlers.getUser(fastify)
  );
};

module.exports = addRoutes;
