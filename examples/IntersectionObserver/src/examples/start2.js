let labelBlock;

const onIntersection = (entries, observer) => {
  const entry = entries[0];
  if (entry.isIntersecting) {
    entry.target.classList.add("visible");
    if (labelBlock.textContent === "Не видно") {
      labelBlock.innerHTML = "<div>Видно</div>";
    } else {
      labelBlock.innerHTML = labelBlock.innerHTML + "<div>Видно</div>";
    }
  } else {
    entry.target.classList.remove("visible");
    labelBlock.textContent = "Не видно";
  }
};

let observer;

const cleanUp = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

const run = async ({ app, buttons, content }) => {
  cleanUp();
  const mainContainer = document.createElement("div");
  mainContainer.classList = "container3";
  const сontainer2 = document.createElement("div");
  сontainer2.classList = "container4";
  const block = document.createElement("div");
  block.classList = "block2";
  block.textContent = "Блок для отслеживания";
  labelBlock = document.createElement("div");
  labelBlock.classList = "label";
  labelBlock.textContent = "Не видно";

  сontainer2.appendChild(block);
  mainContainer.appendChild(сontainer2);

  observer = new IntersectionObserver(onIntersection, {
    root: null, // отслеживаем внутри контейнера
    rootMargin: "0px", // отступы вокруг контейнера
    threshold: 0, // размер видимой области
  });

  observer.observe(block);
  content.appendChild(mainContainer);
  content.appendChild(labelBlock);
};

export default {
  run,
  cleanUp,
};
