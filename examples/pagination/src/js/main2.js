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
    <div class="option">
        <input type="radio" name="mode" id="${appConstants.buttons.example1}" value="${appConstants.buttons.example1}" class="clicked" />
        <label for="${appConstants.buttons.example1}">Simple</label>
    </div>
    <div class="option">
        <input type="radio" name="mode" id="${appConstants.buttons.example2}" value="${appConstants.buttons.example2}" class="clicked" />
        <label for="${appConstants.buttons.example2}">Debounce</label>
    </div>
    <div class="option">
        <input type="radio" name="mode" id="${appConstants.buttons.example3}" value="${appConstants.buttons.example3}" class="clicked" />
        <label for="${appConstants.buttons.example3}">Throttle</label>
    </div>
    <div class="option">
        <input type="radio" name="mode" id="${appConstants.buttons.example4}" value="${appConstants.buttons.example4}" class="clicked" />
        <label for="${appConstants.buttons.example4}">Abort</label>
    </div>
    <button data-name="clear" class="button clear clicked">Clear</button>
`;

const loadItems = () => {
  const mode = document.querySelector('input[name="mode"]:checked');
  if (mode) {
    const modeName = mode.value;
    switch (modeName) {
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
      default: {
        return;
      }
    }
  }
};

const intersectionObserver = new IntersectionObserver((entries) => {
  if (entries[0].intersectionRatio <= 0) return;
  loadItems();
});
intersectionObserver.observe(document.querySelector("#show-more"));

const onClickHandler = (e) => {
  const el = e.target;

  if (el.classList.contains("clicked")) {
    const btnName = el.getAttribute("data-name");
    const modeName = el.getAttribute("value");

    switch (modeName) {
      case appConstants.buttons.example1: {
        const loaded = document.querySelectorAll(".todo");
        Example1(output, loaded.length);
        break;
      }
      case appConstants.buttons.example2: {
        const loaded = document.querySelectorAll(".todo");
        Example2(output, loaded.length);
        break;
      }
      case appConstants.buttons.example3: {
        const loaded = document.querySelectorAll(".todo");
        Example3(output, loaded.length);
        break;
      }
      case appConstants.buttons.example4: {
        const loaded = document.querySelectorAll(".todo");
        Example4(output, loaded.length);
        break;
      }
      default: {
        break;
      }
    }
    switch (btnName) {
      case "clear": {
        output.innerHTML = "";
        break;
      }
      default: {
        break;
      }
    }
  }
};

body.addEventListener("click", onClickHandler);
