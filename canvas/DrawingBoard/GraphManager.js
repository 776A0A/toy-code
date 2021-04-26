export class GraphManager {
    constructor() {
        this._graphs = new Set()
    }
    add(graph) {
        this._graphs.add(graph)
    }
    delete(graph) {
        this._graphs.delete(graph)
    }
    clear() {
        this._graphs.clear()
    }
    get graphs() {
        return [...this._graphs]
    }
}
