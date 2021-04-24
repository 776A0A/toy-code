import { Point, Polygon, Rect } from './shapes.js'

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
        this.currentUpdatingShape = new Rect(this.ctx, x, y, 0, 0)
        this.stage.emitter.emit('add-shape', this.currentUpdatingShape)
    }
    addPolygon({ x, y }) {
        const point = new Point(this.ctx, x, y)

        if (this.currentUpdatingShape) {
            this.currentUpdatingShape.points.push(point)
        } else {
            this.currentUpdatingShape = new Polygon(this.ctx, [point])
        }

        this.stage.emitter.emit('add-shape', this.currentUpdatingShape)
    }
    updatePolygon({ x, y }) {
        const polygon = this.currentUpdatingShape
        if (!polygon) return
        const points = polygon.points
        const point = getPreviewPoint(this.ctx, points)
        points.push(point)
        point.set({ x, y })
        this.stage.emitter.emit('update-screen')

        function getPreviewPoint(ctx, points) {
            if (points[points.length - 1].isPreviewPoint) {
                return points[points.length - 1]
            } else {
                const point = new Point(ctx, x, y)
                point.isPreviewPoint = true
                return point
            }
        }
    }
    commitPolygon({ x, y }) {
        const polygon = this.currentUpdatingShape
        if (!polygon) return
        const points = polygon.points
        if (points[points.length - 1].isPreviewPoint) points.pop()
        const point = new Point(this.ctx, x, y)
        points.push(point)
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
