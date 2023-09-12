import { fetchTodos } from "./api";
import { createToDo } from "./todo";

const example = (targetEl, start = 0) => {
  fetchTodos({start})
    .then((todos) => {
      todos.forEach((todo) => {
        targetEl.appendChild(createToDo(todo));
      });
    })
    .catch((e) => console.log(e));
};

export default example;
