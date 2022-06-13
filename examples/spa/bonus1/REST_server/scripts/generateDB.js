const database = require('../db.json')

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

    const count = await posts.countDocuments()
    if(count > 0 ){
        console.log('The database is already created.')
        return "done."
    }

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


 generateDB()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());

