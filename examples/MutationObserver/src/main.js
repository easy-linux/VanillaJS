import "../css/style.css";
import { example1, example2, example3 } from "./examples";

const buttons = document.querySelector("#buttons");
let container = null;

const allExamples = [
  { id: "example1", name: "Example1", entity: example1 },
  { id: "example2", name: "Example2", entity: example2 },
  { id: "example3", name: "Example3", entity: example3 },
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
};

const onClick = (e) => {
  cleanUpAll();
  console.log(e.target.dataset.exampleId);
  const id = e.target.dataset.exampleId;
  if (id) {
    const example = allExamples.find((ex) => ex.id === id);
    if (example) {
      container = example.entity.run();
    }
  }
  changeSelecting(e.target);
};

const onChange = (event) => {
  const inputId = event.target.getAttribute("id");
  const text = document.querySelector(`#${inputId}Value`);
  switch (inputId) {
    case "width": {
      container.style.width = `${event.target.value}px`
      text.innerHTML = `${event.target.value}px`
      break;
    }
    case "height": {
      container.style.height = `${event.target.value}px`
      text.innerHTML = `${event.target.value}px`
      break;
    }
    case "fontSize": {
      container.style.fontSize = `${event.target.value}px`
      text.innerHTML = `${event.target.value}px`
      break;
    }
    case "fontFamily": {
      container.style.fontFamily = event.target.value
      break;
    }
    case "bgColor": {
      container.style.backgroundColor = event.target.value
      break;
    }
    case "textColor": {
      container.style.color = event.target.value
      break;
    }
    case "counter": {
      container.dataset.counter = event.target.value
      text.innerHTML = event.target.value
      break;
    }
    default: {
      console.log("Неизвестный ID", inputId);
    }
  }
  console.log(event.target.value);
};

const init = () => {
  allExamples.forEach((example) => {
    const btn = document.createElement("button");
    btn.addEventListener("click", onClick);
    btn.textContent = example.name;
    btn.dataset.exampleId = example.id;
    buttons.appendChild(btn);
    const controls = document.querySelector(".controls");
    controls.addEventListener("change", onChange);
  });
};

init();
