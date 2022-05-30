const login = function(fastify) {
  return (request, reply) => {      
        const { login, password } = request.body;
        
              const token = fastify.jwt.sign({
                user_id: '123',
                user_login: login,
                user_name: 'user name',
                randomData: Math.random()
              });

              reply.send({ token });
  };
};

module.exports = {
  login,
};
