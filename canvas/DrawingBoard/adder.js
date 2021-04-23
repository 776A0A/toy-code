export class Adder {
    constructor(stage) {
        this.stage = stage
        this.shapeMode = 'rect'

        this.stage.emitter.listen('mousedown', (evt) => {})
    }
    get switchTo() {
        return {
            rect: () => (this.shapeMode = 'rect'),
            polygon: () => (this.shapeMode = 'polygon'),
        }
    }
}
