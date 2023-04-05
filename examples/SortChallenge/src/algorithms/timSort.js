/*
Timsort - это эффективный алгоритм сортировки, который сочетает в себе сортировку вставками и сортировку слиянием. 
*/

const MIN_MERGE = 32;

function calcMinRun(n) {
  let r = 0;
  while (n >= MIN_MERGE) {
    r |= n & 1;
    n >>= 1;
  }
  return n + r;
}

function makeRuns(arr, minRun) {
  const n = arr.length;
  const runs = [];

  let start = 0;
  while (start < n) {
    let end = start + minRun;
    if (end > n) {
      end = n;
    }

    // Сортировка вставками
    for (let i = start + 1; i < end; i++) {
      const temp = arr[i];
      let j = i - 1;
      while (j >= start && arr[j] > temp) {
        arr[j + 1] = arr[j];
        j--;
      }
      arr[j + 1] = temp;
    }

    // Добавляем отсортированный подмассив
    runs.push(arr.slice(start, end));

    start = end;
  }

  return runs;
}

function mergeRuns(a, b) {
  const c = new Array(a.length + b.length);
  let ai = 0;
  let bi = 0;
  let ci = 0;

  while (ai < a.length && bi < b.length) {
    if (a[ai] <= b[bi]) {
      c[ci++] = a[ai++];
    } else {
      c[ci++] = b[bi++];
    }
  }

  while (ai < a.length) {
    c[ci++] = a[ai++];
  }

  while (bi < b.length) {
    c[ci++] = b[bi++];
  }

  return c;
}

const timsort = (arr) => {
    const n = arr.length;
  
    // Минимальный размер подмассива для сортировки вставками
    const minRun = calcMinRun(n);
  
    // Разбиваем массив на подмассивы размера minRun
    const runs = makeRuns(arr, minRun);
  
    // Слияние подмассивов в один отсортированный массив
    while (runs.length > 1) {
      const run1 = runs.shift();
      const run2 = runs.shift();
      const mergedRun = mergeRuns(run1, run2);
      runs.push(mergedRun);
    }
  
    return runs[0];
  }

export default timsort
