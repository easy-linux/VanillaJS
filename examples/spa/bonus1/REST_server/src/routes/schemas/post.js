const postShort = {
  $id: 'postShort',
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "post public ID"
    },
    "title": {
      "type": "string",
      "description": "post title"
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

const postFull = {
  $id: 'postFull',
  "type": "object",
  properties: {
    ...postShort.properties,
    user: {$ref: 'user#'}
  }
}

module.exports = {postShort, postFull};