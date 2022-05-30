const user = require('./user')
const { postShort, postFull } = require('./post')
const { commentShort, commentFull, commentWithOutPost } = require('./comment')
const { queryPagination } = require('./querystrings')
const pagination = require('./pagination')

module.exports = (fastify) => {
    fastify.addSchema(user)
    fastify.addSchema(postShort)
    fastify.addSchema(postFull)
    fastify.addSchema(commentShort)
    fastify.addSchema(commentFull)
    fastify.addSchema(commentWithOutPost)
    fastify.addSchema(queryPagination)
    fastify.addSchema(pagination)

}