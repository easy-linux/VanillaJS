import { GetGenerator } from "./generator3.js";

const output = document.querySelector(".output");
if (output) {

  const IterableObject = {
    name: 'IterableObject',
    [Symbol.iterator]: GetGenerator
  }

  const data = [...IterableObject]
  data.forEach((value) => {
    const div = document.createElement("div");
    div.textContent = value;
    output.appendChild(div);
  });
}
