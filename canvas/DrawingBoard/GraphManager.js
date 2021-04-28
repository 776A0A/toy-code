export class GraphManager {
    constructor() {
        this._graphs = new Set()
    }
    add(graph, insertIndex) {
        if (insertIndex !== undefined) {
            const graphs = this.graphs
            graphs.splice(insertIndex, 0, graph)
            this.graphs = graphs
        } else this._graphs.add(graph)
    }
    delete(graph) {
        this._graphs.delete(graph)
    }
    clear() {
        this._graphs.clear()
    }
    set graphs(graphs) {
        this._graphs = new Set(graphs)
    }
    get graphs() {
        return [...this._graphs]
    }
}
