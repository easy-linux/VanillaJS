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

export default smoothSort
