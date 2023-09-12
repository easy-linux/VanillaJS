import "../styles/main.scss";
import appConstants from "./constants";
import Example1 from "./example1";
import Example2 from "./example2";
import Example3 from "./example3";
import Example4 from "./example4";

const buttons = document.querySelector("#buttons");
const output = document.querySelector("#output");
const body = document.querySelector("body");

buttons.innerHTML = `
    <button data-name="${appConstants.buttons.example1}" class="button">Simple</button>
    <button data-name="${appConstants.buttons.example2}" class="button">Debounce</button>
    <button data-name="${appConstants.buttons.example3}" class="button">Throttle</button>
    <button data-name="${appConstants.buttons.example4}" class="button">Abort</button>
    <button data-name="clear" class="button clear">Clear</button>
`;

const onClickHandler = (e) => {
  const el = e.target;
  if (el.classList.contains("button")) {
    const btnName = el.getAttribute("data-name");
    switch (btnName) {
      case appConstants.buttons.example1: {
        const loaded = document.querySelectorAll(".todo");
        Example1(output, loaded.length);
        return;
      }
      case appConstants.buttons.example2: {
        const loaded = document.querySelectorAll(".todo");
        Example2(output, loaded.length);
        return;
      }
      case appConstants.buttons.example3: {
        const loaded = document.querySelectorAll(".todo");
        Example3(output, loaded.length);
        return;
      }
      case appConstants.buttons.example4: {
        const loaded = document.querySelectorAll(".todo");
        Example4(output, loaded.length);
        return;
      }
      case "clear": {
        output.innerHTML = "";
        return;
      }
      default: {
        return;
      }
    }
  }
};

body.addEventListener("click", onClickHandler);
