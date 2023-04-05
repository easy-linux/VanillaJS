/*
Интроспективная сортировка
*/
  
  function partition(arr, left, right) {
    const pivot = arr[Math.floor((left + right) / 2)];
  
    while (left <= right) {
      while (arr[left] < pivot) {
        left++;
      }
  
      while (arr[right] > pivot) {
        right--;
      }
  
      if (left <= right) {
        swap(arr, left, right);
        left++;
        right--;
      }
    }
  
    return left;
  }
  
  function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
      const current = arr[i];
      let j = i - 1;
  
      while (j >= 0 && arr[j] > current) {
        arr[j + 1] = arr[j];
        j--;
      }
  
      arr[j + 1] = current;
    }
  }
  
  function heapSort(arr) {
    buildHeap(arr);
  
    for (let i = arr.length - 1; i > 0; i--) {
      swap(arr, 0, i);
      heapify(arr, 0, i);
    }
  }
  
  function buildHeap(arr) {
    const heapSize = arr.length;
  
    for (let i = Math.floor(heapSize / 2); i >= 0; i--) {
      heapify(arr, i, heapSize);
    }
  }
  
  function heapify(arr, index, heapSize) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    let largest = index;
  
    if (left < heapSize && arr[left] > arr[largest]) {
      largest = left;
    }
  
    if (right < heapSize && arr[right] > arr[largest]) {
      largest = right;
    }
  
    if (largest !== index) {
      swap(arr, index, largest);
      heapify(arr, largest, heapSize);
    }
  }
  
  function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  function introSort(arr, depthLimit = Math.floor(Math.log2(arr.length)) * 2) {
    if (arr.length <= 1) return arr;
  
    const maxDepth = depthLimit;
    const partitionSize = partition(arr, 0, arr.length - 1);
  
    if (partitionSize < 16) {
      insertionSort(arr);
    } else if (depthLimit === 0) {
      heapSort(arr);
    } else {
        introSort(arr.slice(0, partitionSize), depthLimit - 1);
        introSort(arr.slice(partitionSize), depthLimit - 1);
    }
  
    return arr;
  }
  
export default introSort
