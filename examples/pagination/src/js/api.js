import appConstants from "./constants";

export const fetchTodos = ({start}, options = {}) => {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:4000/todos?_start=${start}&_limit=${appConstants.pageLimit}`, options)
      .then((response) => response.json())
      .then(resolve)
      .catch(reject);
  });
};
