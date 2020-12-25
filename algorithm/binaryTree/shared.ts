import { NodeType, CompareFn } from './types';

export class Node {
    left: NodeType = null
    right: NodeType = null
    constructor(public key: number) { }
}

export enum Compare {
    GT = 1,
    LT = -1
}

export const defaultCompareFn: CompareFn = (a, b) => a - b > 0 ? Compare.GT : Compare.LT
