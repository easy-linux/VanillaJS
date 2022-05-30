const getPosts = function (fastify) {
  return (request, reply) => {
    try {
      const decodedToken = fastify.getTokenDecoded(request, reply);
      if (decodedToken) {
        const { limit: _limit, _page, userId, search } = request.query
        const posts = fastify.mongo.db.collection('posts')

        const limit = parseInt(_limit)
        const page = parseInt(_page)

        const searchConditions = {}
        if (userId) {
          searchConditions['userId'] = userId
        }
        if (search) {
          searchConditions['title'] = { '$regex': search, '$options': 'i' }
          searchConditions['text'] = { '$regex': search, '$options': 'i' }
        }

        const searchPipes = [{ '$match': searchConditions },]

        posts.aggregate([
          {
            '$facet': {
              'results': [
                ...searchPipes,
                { '$lookup': { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
                { '$unwind': "$user" },
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

      }
      else {
        fastify.LoginError(request, reply)
      }
    } catch (err) {
      reply.send(err);
    }
  };
};

const getPost = function (fastify) {
  return (request, reply) => {
    try {
      //const decodedToken = fastify.getTokenDecoded(request, reply);
      //if (decodedToken) {
      const { postId } = request.params
      const posts = fastify.mongo.db.collection('posts')

      posts.aggregate([
        { '$match': { _id: postId } },
        { '$lookup': { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
        { '$unwind': "$user" },
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

const getPostComments = function (fastify) {
  return (request, reply) => {
    try {
      const decodedToken = fastify.getTokenDecoded(request, reply);
      if (decodedToken) {
        const { limit: _limit, _page, userId, search } = request.query
        const { postId } = request.params
        const comments = fastify.mongo.db.collection('comments')

        const limit = parseInt(_limit)
        const page = parseInt(_page)

        const searchConditions = {
          'postId': postId
        }
        if (userId) {
          searchConditions['userId'] = userId
        }
        if (search) {
          searchConditions['text'] = { '$regex': search, '$options': 'i' }
        }

        const searchPipes = [{ '$match': searchConditions },]

        comments.aggregate([
          {
            '$facet': {
              'results': [
                ...searchPipes,
                { '$lookup': { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
                { '$unwind': "$user" },
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

      }
      else {
        fastify.LoginError(request, reply)
      }
    } catch (err) {
      reply.send(err);
    }
  };
};

module.exports = {
  getPosts,
  getPost,
  getPostComments,
};
