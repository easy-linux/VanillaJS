import { getPosts } from "../api";
import { createPost } from "../components/post";

let observer;
let postsContainer;

const stickyPost = (entries, observer) => {
  const entry = entries[0];

  if (entry.isIntersecting) {
    entry.target.classList.add("sticky");
  } else {
    entry.target.classList.remove("sticky");
  }
};

const cleanUp = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

const run = async () => {
  cleanUp();
  observer = new IntersectionObserver(stickyPost, { threshold: 0 });
  postsContainer = document.createElement("div");
  postsContainer.style.display = "flex";
  postsContainer.style.flexWrap = "wrap";
  postsContainer.style.gap = "10px";

  const dataPage = await getPosts(1, 100);
  if (dataPage) {
    dataPage.forEach((post, idx) => {
      const postElement = createPost(post);
      if (idx == 10) {
        observer.observe(postElement);
      }

      postsContainer.appendChild(postElement);
    });
  }

  content.appendChild(postsContainer);
};

export default {
  run,
  cleanUp,
};
