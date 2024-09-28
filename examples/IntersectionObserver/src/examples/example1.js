import { getUsers } from "../api";
import { createUser } from "../components/user";

const lazyLoad = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target.querySelector("img");
      img.src = "/spinner.svg";
      setTimeout(() => {
        img.src = img.dataset.src;
        observer.unobserve(entry.target); // Останавливаем наблюдение после загрузки
      }, 2000);
    }
  });
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
  observer = new IntersectionObserver(lazyLoad);
  const usersContainer = document.createElement("div");
  usersContainer.classList = 'users-container';

  const users = await getUsers();
  users.forEach((user) => {
    const userElement = createUser(user, true);
    usersContainer.appendChild(userElement);
    observer.observe(userElement);
  });

  content.appendChild(usersContainer);
};

export default {
  run,
  cleanUp,
};
