/*
Сортировка расческой
*/

const combSort = (arr) => {
    const shrinkFactor = 1.3;
    let gap = arr.length;
    let swapped = true;
    while (gap > 1 || swapped) {
        gap = Math.floor(gap / shrinkFactor);
        if (gap < 1) {
            gap = 1;
        }
        swapped = false;
        let i = 0;
        while (i + gap < arr.length) {
            if (arr[i] > arr[i + gap]) {
                [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
                swapped = true;
            }
            i++;
        }
    }
    return arr;
}

export default combSort