export class Drawer {
    constructor(stage) {
        this.stage = stage
        this.canvas = stage.canvas

        this.stage.emitter.listen('update-screen', (shapes) => {
            this.draw(shapes)
        })
        this.stage.emitter.listen('clear-screen', () => {
            this.clear()
        })
    }
    draw(shapes) {
        shapes.forEach((shape) => shape.draw())
    }
    clear() {
        this.canvas
            .getContext('2d')
            .clearRect(0, 0, this.canvas.width, this.canvas.hei)
    }
}
