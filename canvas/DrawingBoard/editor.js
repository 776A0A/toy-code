export class Editor {
    constructor(stage) {
        this.stage = stage
        this.topGraphIndex = undefined
        this.isEditing = false
        this.editMode = 'drag'
        this.dragPosition = { x: 0, y: 0 }
        this.isDragging = false
        this.isResizing = false
    }
    get switchTo() {
        return {
            resize: () => {
                this.editMode = 'resize'
                this.isResizing = true
            },
            drag: () => {
                this.editMode = 'drag'
                this.isDragging = true
            },
        }
    }
    get ctx() {
        return this.stage.canvas.getContext('2d')
    }
    edit(position, graphs) {
        if (!this.isEditing) return

        if (this.editMode === 'resize') this.handleResize(position, graphs)
        else if (this.editMode === 'drag') this.handleDrag(position, graphs)
        else throw Error(`没有这个编辑模式：${this.editMode}`)
    }
    pick(position, graphs) {
        if (!graphs.length) return

        if (this.isEditing && this.isPickControlPoint(position)) {
            this.switchTo.resize()
        } else {
            const top = this.findTop(position, graphs)

            // 没有选中过，什么都不做
            if (top === undefined && this.topGraphIndex === undefined) return

            if (top !== undefined) {
                this.isEditing = true
                this.handleIfChangedShape(top, graphs)
                this.topGraphIndex = top
                this.recordDragPosition(position) // 记录拖拽鼠标位置
                this.switchTo.drag()
            } else {
                // TODO 转移到stop中
                graphs[this.topGraphIndex]?.set({ color: '#f00' })
                this.topGraphIndex = undefined
                this.isEditing = false
            }

            this.stage.emitter.emit('update-screen')
        }
    }
    stop() {
        this.isDragging = this.isResizing = false
    }
    finish(graphs) {
        if (this.topGraphIndex !== undefined) {
            graphs[this.topGraphIndex].set({ color: '#f00' })
            this.stage.emitter.emit('update-screen')
        }
        this.isEditing = this.isDragging = this.isResizing = false
        this.topGraphIndex = undefined
        this.dragPosition = { x: 0, y: 0 }
    }
    findTop({ x, y }, graphs = []) {
        let top
        const { ctx } = this

        ;[...graphs].forEach((shape, idx) => {
            shape.drawPath()
            if (ctx.isPointInPath(x, y)) top = idx
        })

        return top
    }
    isPickControlPoint({ x, y }) {}
    handleIfChangedShape(top, graphs) {
        if (top === this.topGraphIndex) return // 点选的同一个图形，直接返回
        graphs[this.topGraphIndex]?.set({ color: '#f00' })
        graphs[top].set({ color: '#0f0' })
    }
    handleResize({ x, y }, graphs) {
        if (!this.isResizing) return
    }
    recordDragPosition({ x, y }) {
        this.dragPosition = { x, y }
    }
    handleDrag({ x, y }, graphs) {
        if (!this.isDragging) return

        const graph = graphs[this.topGraphIndex]

        const diff = {
            x: x - this.dragPosition.x,
            y: y - this.dragPosition.y,
        }

        if (graph.name === 'rect') {
            graph.set({
                x: graph.x + diff.x,
                y: graph.y + diff.y,
            })
        } else if (graph.name === 'polygon') {
            graph.points.forEach((point) => {
                point.set({
                    x: point.x + diff.x,
                    y: point.y + diff.y,
                })
            })
        }

        this.dragPosition = { x, y }

        this.stage.emitter.emit('update-screen')
    }
}
