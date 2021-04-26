export class Display {
    constructor(stage) {
        this.stage = stage
        this.canvas = stage.canvas
    }
    draw(graphs) {
        graphs.forEach((graph) => graph.draw())
    }
    clear() {
        this.canvas
            .getContext('2d')
            .clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    update(graphs) {
        this.clear()
        this.draw(graphs)
    }
}
