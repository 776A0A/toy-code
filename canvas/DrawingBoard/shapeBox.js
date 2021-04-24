export class ShapeBox {
    constructor(stage) {
        this.stage = stage
        this._shapes = new Set()

        this.stage.emitter.listen('add-shape', (shape) => this.add(shape))
    }
    add(shape) {
        this._shapes.add(shape)
    }
    remove(shape) {
        this._shapes.delete(shape)
    }
    clear() {
        this._shapes.clear()
    }
    get shapes() {
        return [...this._shapes]
    }
}
