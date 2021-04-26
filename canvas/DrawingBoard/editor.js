import { Circle, DEFAULT_COLOR } from './Graph.js'
import * as events from './events.js'

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
        this.graphs = []
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
        this.graphs = graphs

        if (!this.isEditing || this.editMode === 'wait') return

        if (this.editMode === 'resize') this.handleResize(position, graphs)
        else if (this.editMode === 'drag') this.handleDrag(position, graphs)
        else throw Error(`没有这个编辑模式：${this.editMode}`)
    }
    delete() {
        const graph = this.graphs[this.topGraphIndex]
        if (!graph) return
        this.topGraphIndex = undefined
        this.controlPoint = null
        this.stop()
    }
    pick(position, graphs) {
        this.graphs = graphs
        if (!graphs.length) return

        const pickedControlPointIndex = this.findPickControlPoint(position)
        if (
            this.isEditing &&
            this.topGraphIndex !== undefined &&
            pickedControlPointIndex !== -1
        ) {
            this.controlPoint.pickedControlPointIndex = pickedControlPointIndex
            const graph = graphs[this.topGraphIndex]
            if (graph.name === 'rect') {
                const diagonalPoint = this.controlPoint.controller[
                    (pickedControlPointIndex + 2) %
                        this.controlPoint.controller.length
                ]
                const [x, y] = diagonalPoint.getTranslate()
                graph.attr({ x, y }).updateChildrenDiff()
            }
            this.switchTo.resize()
        } else {
            const top = this.findTop(position, graphs)

            // 没有选中过，什么都不做
            if (top === undefined && this.topGraphIndex === undefined) return

            if (top !== undefined) {
                if (top !== this.topGraphIndex) {
                    this.controlPoint?.clearPoints()
                    this.controlPoint = new ControlPoint(graphs[top])
                }
                this.isEditing = true
                this.topGraphIndex = top
                this.recordDragPosition(position) // 记录拖拽鼠标位置
                this.switchTo.drag()
            } else {
                this.isEditing = false
                this.topGraphIndex = undefined
                this.controlPoint?.clearPoints()
                this.controlPoint = null
            }

            this.stage.emitter.emit(events.REFRESH_SCREEN)
        }
    }
    stop() {
        this.switchTo.wait()
        this.isDragging = this.isResizing = false
    }
    end() {
        if (this.topGraphIndex !== undefined) {
            this.graphs[this.topGraphIndex].removeChild(
                ...this.controlPoint.controller
            )
            this.stage.emitter.emit(events.REFRESH_SCREEN)
        }
        this.isEditing = this.isDragging = this.isResizing = false
        this.topGraphIndex = undefined
        this.dragPosition = { x: 0, y: 0 }
        this.graphs = []
        this.controlPoint = null
    }
    findTop({ x, y }, graphs = []) {
        let top
        const { ctx } = this

        ;[...graphs].forEach((graph, idx) => {
            ctx.save()
            graph.drawPath()
            ctx.restore()
            // TODO 因为文字的原因，还需要增加判断是否在stroke上，可以在editor中增加方法抹平判断
            if (ctx.isPointInPath(x, y)) top = idx
        })

        return top
    }
    findPickControlPoint({ x, y }) {
        if (!this.controlPoint) return -1

        return this.controlPoint.controller.findIndex((circle) => {
            const translate = circle.getTranslate()
            return (
                getDistance({ x: translate[0], y: translate[1] }, { x, y }) <=
                circle.r
            )
        })
    }
    handleResize({ x, y }, graphs) {
        if (!this.isResizing) return
        const graph = graphs[this.topGraphIndex]
        if (graph.name === 'rect') {
            graph.attr({ width: x - graph.x, height: y - graph.y })
            this.controlPoint.updatePoints()
        } else if (graph.name === 'polygon') {
            // TODO 只要更新了自身的坐标，就要运行updatePointsDiff和updateChildrenDiff
            if (this.controlPoint.pickedControlPointIndex === 0) {
                graph.attr({ x, y }).updatePointsDiff().updateChildrenDiff()
            } else {
                graph.points[this.controlPoint.pickedControlPointIndex]
                    ?.attr({ x, y })
                    .updateParentAndDiff()
            }
            this.controlPoint.updatePoints({ x, y })
        }
        graph.emitter.emit(events.SIZE_CHANGED)
        this.stage.emitter.emit(events.REFRESH_SCREEN)
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
            graph.attr({
                x: graph.x + diff.x,
                y: graph.y + diff.y,
            })
        } else if (graph.name === 'polygon') {
            // TODO 建立point的x，y和polygon的x，y之间的关系，使得不用更新每一个point的属性，也就是说point的坐标可以通过计算得出
            graph.points.forEach((point) => {
                point.attr({
                    x: point.x + diff.x,
                    y: point.y + diff.y,
                })
            })
        }

        this.dragPosition = { x, y }

        this.controlPoint.updatePoints()
        this.stage.emitter.emit(events.REFRESH_SCREEN)
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
            pickedPoint.attr(position).updateParentAndDiff()
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
            fillColor: DEFAULT_COLOR,
        })
    }
    createController(points = []) {
        return points.map(([x, y]) => this.pointFactory(x, y))
    }
}

function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}
