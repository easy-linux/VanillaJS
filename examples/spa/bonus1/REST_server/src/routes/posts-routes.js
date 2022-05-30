const postsHandlers = require("../handlers/posts");
const pagination = require("./schemas/pagination")
const post = require('./schemas/post')
const comment = require('./schemas/comment')
const querystrings = require('./schemas/querystrings')

const addRoutes = fastify => {
  const tags = [{ name: "posts", description: "  -  Posts related end-points" }];

  fastify.get(
    "/posts",
    {
      preValidation: (request, reply, done) => {
        fastify.authenticate(request, reply, done);
      },
      schema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Posts",
        "description": "Get posts list  with pagination",
        "tags": ['post'],
        "summary": "Get posts list",
        "querystring": {$ref: 'queryPagination#'},
        "response": {
          "200": {
            "description": "Successful responce",
            "type": "object",
            "properties": {
              "results": {
                "type": "array",
                "items": {$ref: 'postFull#'},
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
    postsHandlers.getPosts(fastify)
  );

  fastify.get(
    "/post/:postId",
    {
      preValidation: (request, reply, done) => {
        fastify.authenticate(request, reply, done);
      },
      schema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Posts",
        "description": "Get posts list  with pagination",
        "tags": ['post'],
        "summary": "Get post by postId list",
        "params": {
          type: "object",
          properties: {
            postId: {
              type: 'string',
              format: "uuid",
              description: "Post id",
            },
          },
          required: ['postId']
        },
        "response": {
          "200": {
            "description": "Successful responce",
            ...post.postFull

          }
        },
        security: [
          {
            apiKey: []
          }
        ]
      },
    },
    postsHandlers.getPost(fastify)
  );

  fastify.get(
    "/post/:postId/comments",
    {
      preValidation: (request, reply, done) => {
        fastify.authenticate(request, reply, done);
      },
      schema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Posts",
        "description": "Get posts list  with pagination",
        "tags": ['post'],
        "summary": "Get comments list for a post",
        "querystring": {$ref: 'queryPagination#'},
        "response": {
          "200": {
            "description": "Successful responce",
            "type": "object",
            "properties": {
              "results": {
                "type": "array",
                "items": {$ref: 'commentWithOutPost#'},
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
    postsHandlers.getPostComments(fastify)
  );
};

module.exports = addRoutes;
