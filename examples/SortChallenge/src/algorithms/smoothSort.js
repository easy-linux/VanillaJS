/* 
Плавная сортировка
*/

const smoothSort = (arr) => {
    let p = 1;
    let q = 1;
    let r = 0;
    const p1 = [1];
    while (p < arr.length) {
        if ((p & 3) === 3) {
            p1.push(q);
            r = q;
            q <<= 1;
        } else {
            p1.push(q - r);
        }
        p++;
    }
    let pp = p1.length - 1;
    let qq = 0;
    for (let i = arr.length - 1; i >= 1; i--) {
        if (p1[pp] === qq) {
            p--;
            qq = p1[--pp];
        }
        if (arr[i] < arr[i - 1]) {
            [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
            if (qq === 1) {
                let k = pp - 1;
                while (p1[k] === 1) {
                    p1[k] = q - 1;
                    q >>= 1;
                    k--;
                }
                p1[k]--;
                qq = q - 1;
            } else {
                qq--;
            }
        }
    }
    return arr;
}

export const smoothSortWithCompare = (array, compare) => {
    const alpha = 1.5;
    let p = 1, q = 1, r = 0, i;

    function sift() {
        if (r > 1) {
            let temp = p + q - r;
            if (temp > 1) {
                siftDown(p, q, r - 1);
                sift();
                siftUp(temp, q, r - 1);
                sift();
                return;
            }
        }

        if (q > 1) {
            siftDown(p, q - 1, r);
            sift();
        }
    }

    function siftDown(p, q, r) {
        for (i = p + Math.floor(q - p) / alpha; i < q; i = q + (q - i) * alpha) {
            if (compare(array[i], array[i + 1]) > 0) {
                swap(i, i + 1);
                if (i > p) {
                    for (let j = Math.floor(p + (i - p - 1) / alpha); j >= p; j--) {
                        if (compare(array[j], array[j + 1]) > 0) {
                            swap(j, j + 1);
                        } else {
                            break;
                        }
                    }
                }
                if (q - i > 1) {
                    for (let j = Math.floor(i + 1 + (q - i - 2) / alpha); j < q; j++) {
                        if (compare(array[j], array[j + 1]) > 0) {
                            swap(j, j + 1);
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    function siftUp(p, q, r) {
        for (i = q - Math.floor(q - r) / alpha; i > p; i = p + (i - p - 1) / alpha) {
            if (compare(array[i - 1], array[i]) > 0) {
                swap(i - 1, i);
                if (i - p > 1) {
                    for (let j = Math.floor(p + (i - p - 2) / alpha); j >= p; j--) {
                        if (compare(array[j], array[j + 1]) > 0) {
                            swap(j, j + 1);
                        } else {
                            break;
                        }
                    }
                }
                if (q - i > 0) {
                    for (let j = Math.floor(i + 1 + (q - i - 1) / alpha); j < q; j++) {
                        if (compare(array[j], array[j + 1]) > 0) {
                            swap(j, j + 1);
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    function swap(i, j) {
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    while (q < array.length) {
        r = p;
        p = q;
        q = p + (p - r) * alpha;
        sift();
    }

    q = array.length;
    while (p > 1) {
        r = p;
        p = q - (q - p) * alpha;
        sift();
    }
}



export default smoothSort
