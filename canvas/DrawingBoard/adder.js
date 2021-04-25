import { Point, Polygon, Rect, DEFAULT_FILL_COLOR } from './shapes.js'

export class Adder {
    constructor(stage) {
        this.stage = stage
        this.canvas = stage.canvas
        this.shapeMode = 'rect'
        this.currentUpdatingShape = null
        this.isDrawing = false
    }
    get switchTo() {
        return {
            rect: () => (this.shapeMode = 'rect'),
            polygon: () => (this.shapeMode = 'polygon'),
        }
    }
    get ctx() {
        return this.canvas.getContext('2d')
    }
    add(position) {
        if (this.shapeMode === 'rect') this.addRect(position)
        else if (this.shapeMode === 'polygon') this.addPolygon(position)
        else {
            throw Error(`没有这个图形：${this.shapeMode}`)
        }

        this.isDrawing = true
    }
    update(position) {
        if (!this.isDrawing) return
        if (this.shapeMode === 'rect') this.updateRect(position)
        else if (this.shapeMode === 'polygon') this.updatePolygon(position)
    }
    updateRect({ x, y }) {
        const rect = this.currentUpdatingShape
        if (!rect) return
        rect.set({
            width: x - rect.x,
            height: y - rect.y,
        })
        this.stage.emitter.emit('update-screen')
    }
    addRect({ x, y }) {
        this.currentUpdatingShape = new Rect({
            ctx: this.ctx,
            x,
            y,
            width: 0,
            height: 0,
            fillColor: DEFAULT_FILL_COLOR,
        })
        this.stage.emitter.emit('add-shape', this.currentUpdatingShape)
    }
    addPolygon({ x, y }) {
        const point = new Point({ ctx: this.ctx, x, y })

        if (this.currentUpdatingShape) {
            this.currentUpdatingShape.addPoint(point)
        } else {
            this.currentUpdatingShape = new Polygon({
                ctx: this.ctx,
                points: [point],
                fillColor: DEFAULT_FILL_COLOR,
            })
        }

        this.stage.emitter.emit('add-shape', this.currentUpdatingShape)
    }
    updatePolygon({ x, y }) {
        const polygon = this.currentUpdatingShape
        if (!polygon) return
        const points = polygon.points
        let point
        if (points[points.length - 1].isPreviewPoint) {
            point = points[points.length - 1]
        } else {
            point = new Point({ ctx: this.ctx, x, y })
            point.isPreviewPoint = true
            polygon.addPoint(point)
        }
        point.set({ x, y })
        this.stage.emitter.emit('update-screen')
    }
    commitPolygon({ x, y }) {
        const polygon = this.currentUpdatingShape
        if (!polygon) return
        polygon.points = polygon.points.filter((point) => !point.isPreviewPoint) // 删除所有预览点
        polygon.popPoint() // 因为dblclick也会触发mousedown事件，所有实际在mousedown时已经添加了两个点
        this.isDrawing = false
        this.currentUpdatingShape = null
    }
    stop(type, position) {
        if (this.shapeMode === 'polygon') {
            if (type === 'dblclick' && position) {
                return this.commitPolygon(position)
            } else return
        }
        this.isDrawing = false
        this.currentUpdatingShape = null
    }
}
