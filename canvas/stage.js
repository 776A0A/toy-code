class Stage {
    constructor(ctx) {
        this.ctx = ctx
        this.shapes = []
        this.mode = 'normal'
        this.topShapeIndex = undefined
        this.editingColor = '#0f0'
    }
    draw() {
        this.shapes.forEach((shape) => shape.draw())
    }
    clear() {
        const { ctx } = this
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
    append() {}
    switchMode(mode) {
        this.mode = mode // normal, edit
    }
    pick({ x, y }) {
        if (this.mode === 'edit') {
        }
    }
    findTop({ x, y }) {
        let top
        const { ctx, shapes } = this

        ;[...shapes].forEach((shape, idx) => {
            shape.drawPath()
            if (ctx.isPointInPath(x, y)) top = idx
        })

        if (top !== undefined) this.topShapeIndex = top
        else this.topShapeIndex = undefined
    }
}

export default Stage
