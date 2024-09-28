import { getPosts } from "../api";
import { createPost } from "../components/post";

let observer;
let currentPage = 1;
let timeout;
let postsContainer;
let lastElement;
let loadedAll = false;

const loadPage = async (page) => {
  const dataPage = await getPosts(page);
  if (dataPage) {
    dataPage.forEach((post) => {
      const postElement = createPost(post);
      postsContainer.appendChild(postElement);
    });
    if(dataPage.length === 0){
        loadedAll = true;
        lastElement.innerHTML = '';
        observer.disconnect();
    } 
    return dataPage.length
  }
};

const lazyPage = (entries, observer) => {
  if (timeout) return;
  const entry = entries[0];
  if (entry.isIntersecting) {
    lastElement.innerHTML = '<img src="/spinner.svg" />';
    timeout = setTimeout(async() => {
      const count = await loadPage(currentPage);
      if(count){
        currentPage += 1;
      }
      timeout = null;
    }, 2000);
  } else {
    lastElement.innerHTML = "";
  }
};

const cleanUp = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  postsContainer = null;
  lastElement = null;
};

const run = () => {
  cleanUp();
  observer = new IntersectionObserver(lazyPage, { threshold: 1 });
  postsContainer = document.createElement("div");
  postsContainer.style.display = "flex";
  postsContainer.style.flexWrap = "wrap";
  postsContainer.style.gap = "10px";

  lastElement = document.createElement("div");
  lastElement.style.display = "flex";
  lastElement.style.justifyContent = "center";
  lastElement.style.minHeight = "20px";
  lastElement.style.margin = "10px";
  lastElement.className = "last-element";
  content.appendChild(postsContainer);
  content.appendChild(lastElement);
  observer.observe(lastElement);
};

export default {
  run,
  cleanUp,
};
