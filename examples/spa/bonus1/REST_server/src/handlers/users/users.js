const getUsers = function (fastify) {
  return (request, reply) => {
    try {
      //const decodedToken = fastify.getTokenDecoded(request, reply);
      //if (decodedToken) {
      const { limit: _limit, _page, userId, search } = request.query
      const users = fastify.mongo.db.collection('users')
      const limit = parseInt(_limit)
      const page = parseInt(_page)

      const searchConditions = {}
      if(userId){
        searchConditions['id'] = userId
      }
      if(search){
        searchConditions['user_name'] = {'$regex': search, '$options': 'i'}
        searchConditions['user_fullname'] = {'$regex': search, '$options': 'i'}
      }

      const searchPipes = [{'$match': searchConditions},]

      users.aggregate([
        {
          '$facet': {
            'results': [
              ...searchPipes,
              { '$skip': limit * (page - 1) }, { '$limit': limit }],
            'pagination': [
              ...searchPipes,
              {
                '$count': 'totalCount'
              },

              {
                '$set': {
                  "page": page,
                  "limit": limit
                }
              }
            ]
          },

        },
        { '$unwind': "$pagination" },
      ]).toArray().then(data => {
        reply.send(data[0]);
      }, error => {
        reply.send(error);
      })

      //}
    } catch (err) {
      reply.send(err);
    }
  };
};

const getUser = function (fastify) {
  return (request, reply) => {
    try {
      //const decodedToken = fastify.getTokenDecoded(request, reply);
      //if (decodedToken) {
      const { userId } = request.params
      const users = fastify.mongo.db.collection('users')

      users.findOne(
        {'_id': userId},
      ).then(data => {
        reply.send(data);
      }, error => {
        reply.send(error);
      })

      //}
    } catch (err) {
      reply.send(err);
    }
  };
};


module.exports = {
  getUsers,
  getUser
};
