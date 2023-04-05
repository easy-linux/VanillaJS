/*
Придурковатая сортировка
*/

const stoogeSort = (arr, l = 0, h = arr.length - 1) => {
    if (l >= h) {
        return arr;
    }

    // Если первый элемент меньше последнего, то меняем их местами
    if (arr[l] > arr[h]) {
        [arr[l], arr[h]] = [arr[h], arr[l]];
    }

    // Если в массиве больше двух элементов
    if (h - l + 1 > 2) {
        const t = Math.floor((h - l + 1) / 3);

        // Рекурсивно сортируем первые 2/3 элементов
        arr = stoogeSort(arr, l, h - t);

        // Рекурсивно сортируем последние 2/3 элементов
        arr = stoogeSort(arr, l + t, h);

        // Рекурсивно сортируем первые 2/3 элементов снова
        arr = stoogeSort(arr, l, h - t);
    }

    return arr;
}

export default stoogeSort