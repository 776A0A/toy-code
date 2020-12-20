class Node {
    left: NodeType = null
    right: NodeType = null
    constructor(public key: number) { }
}

type CompareFn = (a: number, b: number) => Compare
enum Compare {
    GT = 1,
    LT = -1
}
type NodeCb = (key: number) => void
type TraverseFn = (node: NodeType, cb: NodeCb) => void
type NodeType = Node | null

export default class BinarySearchTree {
    compare: CompareFn = (a, b) => a - b > 0 ? Compare.GT : Compare.LT
    root: NodeType = null
    insert (key: number) {
        if (this.root === null) this.root = new Node(key)
        else this.insertNode(this.root, key)
    }
    insertNode (node: Node, key: number) {
        if (this.compare(key, node.key) === Compare.LT) {
            if (node.left === null) node.left = new Node(key)
            else this.insertNode(node.left, key)
        } else {
            if (node.right === null) node.right = new Node(key)
            else this.insertNode(node.right, key)
        }
    }
    search (key: number) {
        this.searchNode(this.root, key)
    }
    searchNode (node: NodeType, key: number): boolean {
        if (node === null) return false
        const comparedRes = this.compare(key, node.key)
        if (comparedRes === Compare.LT) return this.searchNode(node.left, key)
        else if (comparedRes === Compare.GT) return this.searchNode(node.right, key)
        else return true
    }
    inOrderTraverse (cb: NodeCb) {
        this.inOrderTraverseNode(this.root, cb)
    }
    inOrderTraverseNode: TraverseFn = (node, cb) => {
        if (node !== null) {
            this.inOrderTraverseNode(node.left, cb)
            cb(node.key)
            this.inOrderTraverseNode(node.right, cb)
        }
    }
    preOrderTraverse (cb: NodeCb) {
        this.preOrderTraverseNode(this.root, cb)
    }
    preOrderTraverseNode: TraverseFn = (node, cb) => {
        if (node !== null) {
            cb(node.key)
            this.preOrderTraverseNode(node.left, cb)
            this.preOrderTraverseNode(node.right, cb)
        }
    }
    postOrderTraverse (cb: NodeCb) {
        this.postOrderTraverseNode(this.root, cb)
    }
    postOrderTraverseNode: TraverseFn = (node, cb) => {
        if (node !== null) {
            this.preOrderTraverseNode(node.left, cb)
            this.preOrderTraverseNode(node.right, cb)
            cb(node.key)
        }
    }
    min () {
        return this.minNode(this.root)
    }
    minNode (node: NodeType) {
        let current = node
        while (current !== null && current.left !== null) {
            current = current.left
        }
        return current
    }
    max () {
        return this.maxNode(this.root)
    }
    maxNode (node: NodeType) {
        let current = node
        while (current !== null && current.right !== null) {
            current = current.right
        }
        return current
    }
    remove (key: number) {
        this.root = this.removeNode(this.root, key)
    }
    removeNode (node: NodeType, key: number): NodeType {
        if (node === null) return null
        // 要移除的node比当前的小
        if (this.compare(key, node.key) === Compare.LT) {
            node.left = this.removeNode(node.left, key)
            return node
        } else if (this.compare(key, node.key) === Compare.GT) {
            node.right = this.removeNode(node.right, key)
            return node
        } else {
            // 叶子节点
            if (node.left === node.right === null) {
                node = null
                return node 
            }
            if (node.left === null) {
                node = node.right
                return node
            } else if (node.right === null) {
                node = node.left
                return node
            }
            const aux = this.minNode(node.right)
            node.key = aux?.key!
            node.right = this.removeNode(node.right, aux?.key!)
            return node
        }
    }
}
