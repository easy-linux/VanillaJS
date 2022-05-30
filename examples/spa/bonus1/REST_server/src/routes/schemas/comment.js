
const commentShort = {
  $id: "commentShort",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "post public ID"
    },
    "text": {
      "type": "string",
      "description": "post text"
    },
    "createdAt": {
      "type": "string",
      "description": "creating date"
    },
  }
}

const commentFull = {
  $id: "commentFull",
  type: "object",
  properties: {
    ...commentShort.properties,
    user: {$ref: 'user#'},
    post: {$ref: 'postShort#'},
  
  }
}

const commentWithOutPost = {
  $id: "commentWithOutPost",
  type: "object",
  properties: {
    ...commentShort.properties,
    user: {$ref: 'user#'},  
  }
}

module.exports = {commentShort, commentFull, commentWithOutPost};