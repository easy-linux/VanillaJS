const schema = {
  $id: 'pagination',
  "type": "object",
  "properties": {
    "totalCount": {
      "type": "number",
      "description": "total count"
    },
    "limit": {
      "type": "number",
      "description": "current limit"
    },
    "page": {
      "type": "number",
      "description": "current page number"
    }
  }
}

module.exports = schema;