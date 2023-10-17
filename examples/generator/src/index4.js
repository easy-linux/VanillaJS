import { ManyGenerators } from "./generator4.js";

const output = document.querySelector(".output");
if (output) {
  const data = [...ManyGenerators()]
  data.forEach((value) => {
    const div = document.createElement("div");
    div.textContent = value;
    output.appendChild(div);
  });
}
