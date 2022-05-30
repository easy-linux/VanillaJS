const getComments = function (fastify) {
  return (request, reply) => {
    try {
      //const decodedToken = fastify.getTokenDecoded(request, reply);
      //if (decodedToken) {
      const { limit: _limit, _page, userId, search } = request.query
      const comments = fastify.mongo.db.collection('comments')
      const params = []
      if (_limit) {
        params.push({ '$limit': _limit })
      }
      if (_page) {
        params.push({ '$skip': _limit * (_page - 1) })
      }
      const limit = parseInt(_limit)
      const page = parseInt(_page)

      const searchConditions = {}
      if(userId){
        searchConditions['userId'] = userId
      }
      if(search){
        searchConditions['title'] = {'$regex': search, '$options': 'i'}
        searchConditions['text'] = {'$regex': search, '$options': 'i'}
      }

      const searchPipes = [{'$match': searchConditions},]
      comments.aggregate([
        {
          '$facet': {
            'results': [
              ...searchPipes,
              { '$lookup': { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
              { '$unwind': "$user" },
              { '$lookup': { from: "posts", localField: "postId", foreignField: "_id", as: "post" } },
              { '$unwind': "$post" },
              { '$skip': limit * (page - 1) }, { '$limit': limit },
              { '$sort': { 'createdAt': 1 } }
            ],
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



module.exports = {
  getComments,
};
