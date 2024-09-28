import { getPosts } from "../api";
import { createPost } from "../components/post";

let observer;
let postsContainer;

const statPost = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const oldValue = parseInt(entry.target.dataset.counter)
      entry.target.dataset.counter = oldValue + 1;
      const counterEl = entry.target.querySelector(".counter");
      if (counterEl) {
        counterEl.innerHTML = `Просмотров: ${entry.target.dataset.counter}`;
      }
    }
  });
};

const cleanUp = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

const run = async () => {
  cleanUp();
  observer = new IntersectionObserver(statPost, { threshold: 1 });
  postsContainer = document.createElement("div");
  postsContainer.style.display = "flex";
  postsContainer.style.flexWrap = "wrap";
  postsContainer.style.gap = "10px";

  const dataPage = await getPosts(1, 100);
  if (dataPage) {
    dataPage.forEach((post, idx) => {
      const postElement = createPost(post);
      postElement.dataset.counter = 0;
      const counter = document.createElement("div");
      counter.className = 'counter';
      counter.innerHTML = '0';
      postElement.appendChild(counter);
      observer.observe(postElement);
      postsContainer.appendChild(postElement);
    });
  }

  content.appendChild(postsContainer);
};

export default {
  run,
  cleanUp,
};
