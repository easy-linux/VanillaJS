export const createToDo = (data) => {
    const todo = document.createElement('article')
    todo.className = 'todo'
    const textId = document.createElement('p')
    textId.className = 'todo-id'
    textId.textContent = data.id
    todo.appendChild(textId)

    const text = document.createElement('p')
    text.className = 'todo-text'
    text.textContent = data.title
    todo.appendChild(text)
    return todo
}
