const database = require('./db.json')

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'webCompinents';

async function generateDB() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const users = db.collection('users');
    const posts = db.collection('posts');
    const comments = db.collection('comments');

    // the following code examples can be pasted here...

    const usersToInsert = database.users.map((user) => {
        return { ...user, type: 'user', _id: user.id }
    })
    await users.insertMany(usersToInsert)

    const postsToInsert = database.posts.map((post) => {
        return { ...post, type: 'post', _id: post.id }
    })
    await posts.insertMany(postsToInsert)

    const commetsToInsert = database.comments.map((comment) => {
        return { ...comment, type: 'comment', _id: comment.id }
    })
    await comments.insertMany(commetsToInsert)

    return 'done.';
}

async function query1() {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const posts = db.collection('posts');
    return await posts.find().toArray()

}

async function queryPosts() {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const posts = db.collection('posts');
    console.log(await posts.countDocuments())
    return await posts.aggregate([
        { '$lookup': { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
        { '$unwind': "$user" },
        { '$skip': 10 },
        { '$limit': 10 },

    ]).toArray()

}

async function queryComments(skip, limit) {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const comments = db.collection('comments');

    const result = await comments.aggregate([
        {
            '$facet': {
                'results': [
                    {'$match': {text: {'$regex': 'asas', '$options': 'i'}}},
                    { '$lookup': { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
                    { '$unwind': "$user" },
                    { '$lookup': { from: "posts", localField: "postId", foreignField: "_id", as: "post" } },
                    { '$unwind': "$post" },
                    { '$skip': skip }, { '$limit': limit }],
                'pagination': [
                    {'$match': {text: {'$regex': 'asas', '$options': 'i'}}},
                    {
                        '$count': 'totalCount'
                    },

                    {
                        '$set': {
                            "skip": skip,
                            "limit": limit
                        }
                    }
                ]
            },
        },
        { '$unwind': "$pagination" },


    ]).toArray()

    console.log(result[0].pagination)

    //console.log(result[0].results)

    return result

}
 generateDB()
//queryComments(10, 10)
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());

