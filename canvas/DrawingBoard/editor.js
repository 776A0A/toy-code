export class Editor {
    constructor(stage) {
        this.stage = stage
        this.topShapeIndex = undefined
        this.isEditing = false
        this.editMode = 'drag'
    }
    get ctx() {
        return this.stage.canvas.getContext('2d')
    }
    edit({ x, y }) {}
    pick({ x, y }, shapes) {
        if (!shapes.length) return
        if (this.isEditing && this.isPickControlPoint({ x, y })) {
            this.editMode = 'resize'
        } else {
            const top = this.findTop({ x, y }, shapes)

            // 没有选中过，什么都不做
            if (top === undefined && this.topShapeIndex === undefined) return

            if (top !== undefined) {
                this.handleIfChangedShape(top, shapes)
                this.isEditing = true
            } else {
                shapes[this.topShapeIndex]?.set({ color: '#f00' })
                this.topShapeIndex = undefined
                this.isEditing = false
            }

            this.stage.emitter.emit('update-screen')
        }
    }
    finish() {}
    findTop({ x, y }, shapes = []) {
        let top
        const { ctx } = this

        ;[...shapes].forEach((shape, idx) => {
            shape.drawPath()
            if (ctx.isPointInPath(x, y)) top = idx
        })

        return top
    }
    isPickControlPoint({ x, y }) {}
    handleIfChangedShape(top, shapes) {
        if (top === this.topShapeIndex) return // 点选的同一个图形，直接返回
        shapes[this.topShapeIndex]?.set({ color: '#f00' })
        shapes[(this.topShapeIndex = top)].set({ color: '#0f0' })
    }
}
