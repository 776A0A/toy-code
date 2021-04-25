import { Circle } from './shapes.js'

export class Editor {
    constructor(stage) {
        this.stage = stage
        this.topGraphIndex = undefined
        this.isEditing = false // 点选到了某一个图形即为true
        this.editMode = 'wait'
        this.dragPosition = { x: 0, y: 0 }
        this.isDragging = false
        this.isResizing = false
        this.controlPoint = null
    }
    get switchTo() {
        return {
            wait: () => {
                this.editMode = 'wait'
            },
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
        if (!this.isEditing || this.editMode === 'wait') return

        if (this.editMode === 'resize') this.handleResize(position, graphs)
        else if (this.editMode === 'drag') this.handleDrag(position, graphs)
        else throw Error(`没有这个编辑模式：${this.editMode}`)
    }
    pick(position, graphs) {
        // BUG 修复误触引起的体验问题
        if (!graphs.length) return

        let pickedControlPointIndex
        if (
            this.isEditing &&
            ((pickedControlPointIndex = this.controlPoint.pickedControlPointIndex = this.isPickControlPoint(
                position
            )),
            pickedControlPointIndex !== -1)
        ) {
            const graph = graphs[this.topGraphIndex]
            if (graph.name === 'rect') {
                const diagonalPoint = this.controlPoint.controller[
                    (pickedControlPointIndex + 2) %
                        this.controlPoint.controller.length
                ]
                graph
                    .set({ x: diagonalPoint.x, y: diagonalPoint.y })
                    .updateChildrenDiff()
            }
            this.switchTo.resize()
        } else {
            const top = this.findTop(position, graphs)

            // 没有选中过，什么都不做
            if (top === undefined && this.topGraphIndex === undefined) return

            graphs[this.topGraphIndex]?.set({ color: '#f00' }) // 重置颜色
            this.controlPoint?.clearPoints()

            if (top !== undefined) {
                graphs[top].set({ color: '#0f0' })
                this.isEditing = true
                this.topGraphIndex = top
                this.controlPoint = new ControlPoint(graphs[top])
                this.recordDragPosition(position) // 记录拖拽鼠标位置
                this.switchTo.drag()
            } else {
                this.isEditing = false
                this.topGraphIndex = undefined
                this.controlPoint = null
            }

            this.stage.emitter.emit('update-screen')
        }
    }
    stop() {
        this.switchTo.wait()
        this.isDragging = this.isResizing = false
    }
    end(graphs) {
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
            ctx.save()
            shape.drawPath()
            ctx.restore()
            // TODO 因为文字的原因，还需要增加判断是否在stroke上，可以在editor中增加方法抹平判断
            if (ctx.isPointInPath(x, y)) top = idx
        })

        return top
    }
    isPickControlPoint({ x, y }) {
        if (!this.controlPoint) return

        return this.controlPoint.controller.findIndex((circle) => {
            return getDistance({ x, y }, circle) <= circle.r
        })
    }
    handleResize({ x, y }, graphs) {
        if (!this.isResizing) return
        const graph = graphs[this.topGraphIndex]
        if (graph.name === 'rect') {
            graph.set({ width: x - graph.x, height: y - graph.y })

            this.controlPoint.updatePoints()
        } else if (graph.name === 'polygon') {
            // TODO 只要更新了自身的坐标，就要运行updatePointsDiff和updateChildrenDiff
            if (this.controlPoint.pickedControlPointIndex === 0) {
                graph.set({ x, y }).updatePointsDiff().updateChildrenDiff()
            } else {
                graph.points[this.controlPoint.pickedControlPointIndex]
                    ?.set({ x, y })
                    .updateParentAndDiff()
            }
            this.controlPoint.updatePoints({ x, y })
        }
        graph.emitter.emit('size-changed')
        this.stage.emitter.emit('update-screen')
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
            // TODO 建立point的x，y和polygon的x，y之间的关系，使得不用更新每一个point的属性，也就是说point的坐标可以通过计算得出
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

class ControlPoint {
    constructor(graph) {
        this.graph = graph
        this.controller = null
        this.pickedControlPointIndex = -1
        this.r = 10
        this.addPoints()
    }
    addPoints() {
        if (this.graph.name === 'rect') {
            const { x, y, width, height } = this.graph
            this.controller = this.createController([
                [x, y],
                [x + width, y],
                [x + width, y + height],
                [x, y + height],
            ])
        } else if (this.graph.name === 'polygon') {
            const points = this.graph.points
            this.controller = this.createController(
                points.map((point) => [point.x, point.y])
            )
        }
        this.graph.appendChild(...this.controller)
    }
    clearPoints() {
        this.graph.removeChild(...this.controller)
    }
    updatePoints(position) {
        if (position) {
            const pickedPoint = this.controller[this.pickedControlPointIndex]
            if (!pickedPoint) return
            pickedPoint.set(position).updateParentAndDiff()
        } else {
            this.clearPoints()
            this.addPoints()
        }
    }
    pointFactory(x, y) {
        return new Circle({
            ctx: this.graph.ctx,
            x,
            y,
            r: this.r,
            fillColor: 'pink',
        })
    }
    createController(points = []) {
        return points.map(([x, y]) => this.pointFactory(x, y))
    }
}

function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}
