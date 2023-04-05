/*
Гномья сортировка
*/

const gnomeSort = (arr) => {
    let len = arr.length;
    let pos = 0;
    
    while (pos < len) {
      if (pos === 0 || arr[pos] >= arr[pos - 1]) {
        pos++;
      } else {
        let temp = arr[pos];
        arr[pos] = arr[pos - 1];
        arr[pos - 1] = temp;
        pos--;
      }
    }
    
    return arr;
  }
  
  export default gnomeSort
  