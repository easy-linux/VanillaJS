const fastify = require('fastify')({
  logger: true
});

const serverConfig = require('./server-config.json')

const start = async () => {
  await fastify.register(require('@fastify/express'));

  fastify.use(require('cors')());
  fastify.use(require('dns-prefetch-control')())
  fastify.use(require('frameguard')())
  fastify.use(require('hide-powered-by')())
  fastify.use(require('hsts')())
  fastify.use(require('ienoopen')())
  fastify.use(require('x-xss-protection')())

  fastify.register(require('./src/plugins/awt-plugin'));
  fastify.register(require('./src/plugins/swagger-plugin'));

  fastify.register(require('@fastify/mongodb'), {
    // force to close the mongodb connection when app stopped
    // the default value is false
    forceClose: true,

    url: 'mongodb://localhost:27017/webCompinents'
  })
  
  require('./src/routes/schemas/allSchemas')(fastify)
  require('./src/decorators')(fastify);
  require('./src/routes')(fastify);


  try {
    //await fastify.listen(3000)

    fastify.listen(serverConfig.port, serverConfig.address, function (err, address) {
      if (err) {
        fastify.log.error(err)
        process.exit(1)
      }
      fastify.log.info(`server listening on ${address}`);
    });


  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start();