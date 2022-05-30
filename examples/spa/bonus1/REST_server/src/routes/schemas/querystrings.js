const queryPagination = {
    $id: 'queryPagination',
    type: "object",
    properties: {
        limit: {
            in: 'query',
            type: 'number',
            description: "max records to return",
        },
        _page: {
            in: 'query',
            type: 'number',
            description: "page number to return",
        },
        userId: {
            in: 'query',
            type: 'string',
            format: "uuid",
            description: "search by userId",
        },
        search: {
            in: 'query',
            type: 'string',
            description: "search by sub-string",
        }

    },
    required: ['limit', '_page']
}


module.exports = { queryPagination };