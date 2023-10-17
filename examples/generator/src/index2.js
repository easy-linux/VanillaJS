import { GetGenerator } from "./generator1.js";

const output = document.querySelector(".output");
if (output) {
  const gen = GetGenerator('Like Array')
  const data = [...gen]
  data.forEach((value) => {
    const div = document.createElement("div");
    div.textContent = value;
    output.appendChild(div);
  });
}
