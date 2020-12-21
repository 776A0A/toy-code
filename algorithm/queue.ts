class Queue {
    count: number
    lowestCount: number
    items: object
    constructor() {
        this.count = this.lowestCount = 0
        this.items = {}
    }
    enqueue (element) {
        this.items[this.count] = element
        this.count++
    }
    dequeue () {
        if (this.isEmpty) return
        const element = this.items[this.lowestCount]
        delete this.items[this.lowestCount]
        this.lowestCount++
        return element
    }
    peek () {
        if (this.isEmpty) return
        return this.items[this.lowestCount]
    }
    get isEmpty () {
        return this.count - this.lowestCount === 0
    }
    get size () {
        return this.count - this.lowestCount
    }
    clear () {
        this.count = this.lowestCount = 0
        this.items = {}
    }
}

interface hotPotatoResult {
    eliminated: any[]
    winner: any
}

function hotPotato (list: any[], num: number): hotPotatoResult {
    const queue = new Queue
    const eliminatedList: any[] = []
    for (let i: number = 0; i < list.length; i++) queue.enqueue(list[i])

    while (queue.size > 1) {
        for (let i: number = 0; i < num; i++) queue.enqueue(queue.dequeue())
        eliminatedList.push(queue.dequeue())
    }
    return {
        eliminated: eliminatedList,
        winner: queue.dequeue()
    }
}

export default Queue
