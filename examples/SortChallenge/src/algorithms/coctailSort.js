/*
Сортировка перемешиванием
*/

const cocktailSort = (arr) => {
    let start = 0;
    let end = arr.length - 1;
    let swapped = true;
    
    while (swapped) {
      // Проход с начала к концу
      swapped = false;
      for (let i = start; i < end; i++) {
        if (arr[i] > arr[i + 1]) {
            let temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swapped = true;
        }
      }
      end--;
      
      // Проход с конца к началу
      for (let j = end; j > start; j--) {
        if (arr[j] < arr[j - 1]) {
            let temp = arr[j];
          arr[j] = arr[j - 1];
          arr[j - 1] = temp;
          swapped = true;
        }
      }
      start++;
    }
    
    return arr;
  }
  
  // Пример использования
  //let arr = [64, 34, 25, 12, 22, 11, 90];
  //var sortedArr = cocktailSort(arr);
  //console.log(sortedArr); // [11, 12, 22, 25, 34, 64, 90]

  export default cocktailSort
  