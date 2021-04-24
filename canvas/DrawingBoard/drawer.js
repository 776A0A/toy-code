export class Drawer {
    constructor(stage) {
        this.stage = stage
        this.canvas = stage.canvas
    }
    draw(shapes) {
        shapes.forEach((shape) => shape.draw())
    }
    clear() {
        this.canvas
            .getContext('2d')
            .clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    update(shapes) {
        this.clear()
        this.draw(shapes)
    }
}
