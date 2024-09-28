import "../css/style.css";
import { start, start2, example1, example2, example3, example4, example5 } from "./examples";

const app = document.querySelector("#app");
const buttons = document.querySelector("#buttons");
const content = document.querySelector("#content");

const allExamples = [
  { id: "start", name: "Start", entity: start },
  { id: "start2", name: "Start2", entity: start2 },
  { id: "example1", name: "Example1", entity: example1 },
  { id: "example2", name: "Example2", entity: example2 },
  { id: "example3", name: "Example3", entity: example3 },
  { id: "example4", name: "Example4", entity: example4 },
  { id: "example5", name: "Example5", entity: example5 },
];

const changeSelecting = (btn) => {
  buttons.childNodes.forEach((node) => {
    if (node === btn) {
      node.classList.add("selected");
    } else {
      node.classList.remove("selected");
    }
  });
};

const cleanUpAll = () => {
  allExamples.forEach((example) => {
    example.entity.cleanUp();
  });
  content.innerHTML = "";
};

const onClick = (e) => {
  cleanUpAll();
  console.log(e.target.dataset.exampleId);
  const id = e.target.dataset.exampleId;
  if (id) {
    const example = allExamples.find((ex) => ex.id === id);
    if (example) {
      example.entity.run({ app, buttons, content });
    }
  }
  changeSelecting(e.target);
};

const init = () => {
  allExamples.forEach((example) => {
    const btn = document.createElement("button");
    btn.addEventListener("click", onClick);
    btn.textContent = example.name;
    btn.dataset.exampleId = example.id;
    buttons.appendChild(btn);
  });
};

init();
