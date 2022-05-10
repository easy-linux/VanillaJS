const comments = new Map()

export const getComment = (commentId) => {
    return comments.get(commentId)
}

export const setComment = (comment) => {
    return comments.set(comment.id, comment)
}

export default {
    getComment, 
    setComment,
}