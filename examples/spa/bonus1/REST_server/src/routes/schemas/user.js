const user = {
  $id: 'user',
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "user's public ID"
    },
    "user_name": {
      "type": "string",
      "description": "users's name"
    },
    "user_fullname": {
      "type": "string",
      "description": "user's full name"
    }
  }
}


module.exports = user;