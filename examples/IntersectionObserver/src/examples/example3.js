import { getPosts } from "../api";
import { createPost } from "../components/post";

let observer;
let postsContainer;

const animatePost = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    } else {
      entry.target.classList.remove("visible");
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
  observer = new IntersectionObserver(animatePost, { threshold: 0.1 });
  postsContainer = document.createElement("div");
  postsContainer.style.display = "flex";
  postsContainer.style.flexWrap = "wrap";
  postsContainer.style.gap = "10px";

  const dataPage = await getPosts(1, 100);
  if (dataPage) {
    dataPage.forEach((post) => {
      const postElement = createPost(post);
      postElement.classList.add('fade-in')
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
