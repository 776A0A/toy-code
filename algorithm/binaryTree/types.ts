import { Node, Compare } from './shared'

export type NodeCb = (key: number) => void
export type TraverseFn = (node: NodeType, cb: NodeCb) => void
export type NodeType = Node | null
export type CompareFn = (a: number, b: number) => Compare



