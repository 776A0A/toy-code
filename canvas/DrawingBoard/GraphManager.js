export class GraphManager {
    constructor(stage) {
        this.stage = stage
        this._graphs = new Set()

        this.stage.emitter.on('add-graph', (graph) => this.add(graph))
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
