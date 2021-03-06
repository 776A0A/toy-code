import { NodeCb, NodeType, CompareFn, TraverseFn } from './types'
import { Node, Compare, defaultCompareFn } from './shared'


export default class BinarySearchTree {
    compare = defaultCompareFn
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
        }
        // 相等的情况
        else {
            // 叶子节点
            if (node.left === node.right === null) {
                node = null
                return node
            }
            // 将子节点上移
            if (node.left === null) {
                node = node.right
                return node
            } else if (node.right === null) {
                node = node.left
                return node
            }
            // 在右子树中找到最小的替换上来
            const aux = this.minNode(node.right)
            node.key = aux?.key!
            // 要记住处理右子节以避免重复节点
            node.right = this.removeNode(node.right, aux?.key!)
            return node
        }
    }
}
