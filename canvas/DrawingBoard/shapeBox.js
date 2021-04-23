export class ShapeBox {
    constructor() {
        this._shapes = new Set()
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
