/*
Сортировка двоичными деревьями
*/

class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinarySortTree {
    constructor() {
        this.root = null;
    }

    insert(value) {
        const node = new Node(value);
        if (this.root === null) {
            this.root = node;
            return this;
        }

        let current = this.root;
        while (true) {
            if (value === current.value) {
                return undefined;
            }
            if (value < current.value) {
                if (current.left === null) {
                    current.left = node;
                    return this;
                }
                current = current.left;
            } else {
                if (current.right === null) {
                    current.right = node;
                    return this;
                }
                current = current.right;
            }
        }
    }

    find(value) {
        if (this.root === null) {
            return false;
        }

        let current = this.root;
        let found = false;
        while (current && !found) {
            if (value < current.value) {
                current = current.left;
            } else if (value > current.value) {
                current = current.right;
            } else {
                found = true;
            }
        }
        return found ? current : false;
    }

    inorderTraversal(node = this.root, arr = []) {
        if (node !== null) {
            this.inorderTraversal(node.left, arr);
            arr.push(node.value);
            this.inorderTraversal(node.right, arr);
        }
        return arr;
    }
}

const btreeSort = (arr) => {
    const l = arr.length
    const tree = new BinarySortTree();
    for(let i = 0; i < l; i++){
        tree.insert(arr[i]);
    }
    return tree.inorderTraversal()
}

export default btreeSort
