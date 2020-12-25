import BinarySearchTree from './binarySearchTree'
import { defaultCompareFn } from './shared';
import { NodeType } from './types';

enum BalanceFactor {
    UNBALANCED_RIGHT,
    SLIGHTLY_UNBALANCED_RIGHT,
    BALANCED,
    SLIGHTLY_UNBALANCED_LEFT,
    UNBALANCED_LEFT
}

class ALVTree extends BinarySearchTree {
    compare = defaultCompareFn
    root: NodeType = null
    insert () { }
    insertNode () { }
    removeNode () { }
    getNodeHeight (node: NodeType): number {
        if (node === null) return -1
        return Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right)) + 1
    }
    getBalanceFactor (node: NodeType) {
        // 计算的差值在0，1，-1为平衡
        const heightDiff = this.getNodeHeight(node?.left ?? null) - this.getNodeHeight(node?.right ?? null)
        switch (heightDiff) {
            case -2 /* 没有左子节点，而右子节点的高度为1 */: 
                return BalanceFactor.UNBALANCED_RIGHT
            case -1:
                return BalanceFactor.SLIGHTLY_UNBALANCED_RIGHT
            case 1:
                return BalanceFactor.SLIGHTLY_UNBALANCED_LEFT
            case 2:
                return BalanceFactor.UNBALANCED_LEFT
            default:
                return BalanceFactor.BALANCED
        }
    }
}
