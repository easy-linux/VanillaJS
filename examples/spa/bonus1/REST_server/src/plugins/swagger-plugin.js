const serverConfig = require('../../server-config.json')
const fp = require("fastify-plugin")
const userSchema  = require("../routes/schemas/user")
const querySchema  = require("../routes/schemas/querystrings")
const postSchema  = require("../routes/schemas/post")
const paginationSchema  = require("../routes/schemas/pagination")

module.exports = fp(async function(fastify, opts) {

  fastify.register(require('@fastify/swagger'), {
    routePrefix: '/docs',
    swagger: {
      info: {
        title: 'REST API documentation ',
        description: 'short documentation how to use server api endpoints',
        version: '0.0.1'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      //host: 'localhost:3333',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
         { name: 'auth', description: 'Auth related end-points' },
         { name: 'user', description: 'User related end-points' },
         { name: 'post', description: 'Post related end-points' },
         { name: 'comment', description: 'Comment related end-points' },
      ],
      definitions: {},
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: "Authorization",
          in: 'header'
        }
      }
    },
    uiConfig: {
      //docExpansion: 'full',
      //deepLinking: false
    },
    exposeRoute: true
  })
  
  fastify.ready(err => {
    if (err) throw err
    fastify.swagger()
  })
})
