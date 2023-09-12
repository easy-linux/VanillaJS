import { fetchTodos } from "./api";
import { createToDo } from "./todo";

let timeout = null;

const example = (targetEl, start = 0) => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  timeout = setTimeout(() => {
    fetchTodos({start})
      .then((todos) => {
        todos.forEach((todo) => {
          targetEl.appendChild(createToDo(todo));
        });
        timeout = null;
      })
      .catch((e) => console.log(e));
  }, 1000);
};

export default example;
