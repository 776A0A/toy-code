type equalFn = (a: any, b: any) => boolean
const defaultEquals: equalFn = (a, b) => a === b

interface StaticNode {
    element: any
    next: Node
}

class Node implements StaticNode {
    constructor(public element, public next = null) { }
}

class LinkList {
    count: number = 0
    head: Node = null
    constructor(public equalFn = defaultEquals) { }
    indexOf (element: any) {
        let current = this.head
        if (!this.size) return
        for (let i = 0; i < this.count; i++) {
            if (this.equalFn(element, current.element)) return i
            current = current.next
        }
        return -1
    }
    push (element: any) {
        const node = new Node(element)
        if (!this.size) this.head = node
        else {
            let current = this.head
            while (current.next !== null) {
                current = current.next
            }
            current.next = node
        }
        this.count++
    }
    insert (element: any, index: number) {
        if (index >= 0 && index < this.count) {
            const node = new Node(element)
            if (index === 0) {
                const current = this.head
                node.next = current
                this.head = node
            } else {
                const pre = this.getElementAt(index - 1)
                const current = pre.next
                node.next = current
                pre.next = node
            }
            this.count++
            return true
        }
        return false
    }
    getElementAt (index: number) {
        if (index >= 0 && index < this.count) {
            let node = this.head
            for (let i = 0; i < index; i++) {
                node = node.next
            }
            return node
        }
    }
    remove (element: any) {
        const index = this.indexOf(element)
        return this.removeAt(index)
    }
    removeAt (index: number) {
        let current = this.head
        if (index === 0) {
            this.head = current.next
        } else {
            const pre = this.getElementAt(index - 1)
            current = pre.next
            pre.next = current.next
        }
        this.count--
        return current.element
    }
    get isEmpty () {
        return this.count === 0
    }
    get size () {
        return this.count
    }
    toString () { }
}

const enum compare {
    LT = -1,
    GT = 1,
    E = 0
}

type compareFn = (a, b) => number
const defaultCompare: compareFn = (a, b) => {
    if (a === b) return compare.E
    return a < b ? compare.LT : compare.GT
}

class SortedLinkList extends LinkList {
    constructor(equalFn = defaultEquals, public compareFn = defaultCompare) {
        super(equalFn)
    }
    insert (element, index = 0) {
        if (this.isEmpty) return super.insert(element, 0)
        const pos = this.getIndexNextSortedElement(element)
        return super.insert(element, pos)
    }
    getIndexNextSortedElement (element) {
        let current = this.head
        if (!current) return 0
        let i = 0
        for (; i < this.size; i++) {
            const comp = this.compareFn(element, current.element)
            if (comp === compare.LT) return i
            current = current.next
        }
        return i
    }
}

export default {
    LinkList
}

class HashTable {
    table: ValuePair
    put (key: string | number, value: any) {
        const position = this.hashCode(key)
        this.table[position] = new ValuePair(key as string, value)
        return true
    }
    remove (key: string | number) {
        const hash = this.hashCode(key)
        const valuePair = this.table[hash]
        if (valuePair != null) {
            delete this.table[hash]
            return true
        }
        return false
    }
    get (key: string | number) {
        const valuePair = this.table[key]
        return valuePair == null ? undefined : valuePair
    }
    loseloseHashCode (key: string | number) {
        if (typeof key === 'number') return key
        key = String(key)
        let hash = 0
        for (let i = 0; i < key.length; i++) {
            hash += key.codePointAt(i)
        }
        return hash % 37
    }
    hashCode (key: string | number) {
        return this.loseloseHashCode(key)
    }
}


class ValuePair {
    constructor(public key: string, public value: any) { }
}
