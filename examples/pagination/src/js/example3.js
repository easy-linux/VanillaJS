import { fetchTodos } from "./api";
import { createToDo } from "./todo";

let timeout = null;

const example = (targetEl, start = 0) => {
  if (timeout) {
    return;
  }
  timeout = setTimeout(() => {
    timeout = null;
  }, 1000);

  fetchTodos({ start })
    .then((todos) => {
      todos.forEach((todo) => {
        targetEl.appendChild(createToDo(todo));
      });
    })
    .catch((e) => console.log(e));
};

export default example;
