const commentsHandlers = require("../handlers/comments");
const pagination = require("./schemas/pagination")
const comment = require('./schemas/comment')
const querystrings = require('./schemas/querystrings')

const addRoutes = fastify => {
  const tags = [{ name: "comments", description: "  -  comments related end-points" }];

  fastify.get(
    "/comments",
    {
      preValidation: (request, reply, done) => {
        fastify.authenticate(request, reply, done);
      },
      schema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Comments",
        "description": "Get comments list with pagination",
        "tags": ['comment'],
        "summary": "Get comments list",
        "querystring": {$ref: 'queryPagination#'},
        "response": {
          "200": {
            "description": "Successful responce",
            "type": "object",
            "properties": {
              "results": {
                "type": "array",
                "items": comment.commentFull,
              },
              "pagination": pagination

            }

          }
        },
        security: [
          {
            apiKey: []
          }
        ]
      }
    },
    commentsHandlers.getComments(fastify)
  );

};

module.exports = addRoutes;
