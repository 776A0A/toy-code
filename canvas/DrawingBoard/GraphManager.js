import * as events from './events.js'

export class GraphManager {
    constructor(stage) {
        this.stage = stage
        this._graphs = new Set()
    }
    add(graph) {
        this._graphs.add(graph)
    }
    remove(graph) {
        this._graphs.delete(graph)
    }
    clear() {
        this._graphs.clear()
    }
    get graphs() {
        return [...this._graphs]
    }
}
