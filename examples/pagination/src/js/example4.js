import { fetchTodos } from "./api";
import { createToDo } from "./todo";

let controller;

const example = (targetEl, start = 0) => {
  if (controller && !controller.signal.aborted) {
    controller.abort();
  }

  controller = new AbortController();
  fetchTodos({ start }, { signal: controller.signal })
    .then((todos) => {
      todos.forEach((todo) => {
        targetEl.appendChild(createToDo(todo));
      });
      controller = null;
    })
    .catch((e) => console.log(e));
};

export default example;
