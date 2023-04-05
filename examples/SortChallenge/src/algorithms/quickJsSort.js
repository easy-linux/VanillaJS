/*
Быстрая JS сортировка
*/

const quickJsSort = (arr) => {
  return arr.sort((a, b) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
};

export default quickJsSort;
