import { Point, Polygon, Rect, DEFAULT_FILL_COLOR } from './Graph.js'
import * as events from './events.js'

export class Adder {
    constructor(stage) {
        this.stage = stage
        this.canvas = stage.canvas
        this.graphMode = 'rect'
        this.currentUpdatingGraph = null
        this.isDrawing = false
    }
    get switchTo() {
        return {
            rect: () => (this.graphMode = 'rect'),
            polygon: () => (this.graphMode = 'polygon'),
        }
    }
    get ctx() {
        return this.canvas.getContext('2d')
    }
    add(position) {
        if (this.graphMode === 'rect') this.addRect(position)
        else if (this.graphMode === 'polygon') this.addPolygon(position)
        else {
            throw Error(`没有这个图形：${this.graphMode}`)
        }

        this.isDrawing = true
    }
    refresh(position) {
        if (!this.isDrawing) return
        if (this.graphMode === 'rect') this.updateRect(position)
        else if (this.graphMode === 'polygon') this.updatePolygon(position)
    }
    updateRect({ x, y }) {
        const rect = this.currentUpdatingGraph
        if (!rect) return
        rect.attr({
            width: x - rect.x,
            height: y - rect.y,
        })
        this.stage.emitter.emit(events.REFRESH_SCREEN)
    }
    addRect({ x, y }) {
        this.currentUpdatingGraph = new Rect({
            ctx: this.ctx,
            x,
            y,
            width: 0,
            height: 0,
            fillColor: DEFAULT_FILL_COLOR,
        })
        this.stage.emitter.emit(events.ADD_GRAPH, this.currentUpdatingGraph)
    }
    addPolygon({ x, y }) {
        const point = new Point({ ctx: this.ctx, x, y })

        if (this.currentUpdatingGraph) {
            this.currentUpdatingGraph.addPoint(point)
        } else {
            this.currentUpdatingGraph = new Polygon({
                ctx: this.ctx,
                points: [point],
                fillColor: DEFAULT_FILL_COLOR,
            })
        }

        this.stage.emitter.emit(events.ADD_GRAPH, this.currentUpdatingGraph)
    }
    updatePolygon({ x, y }) {
        const polygon = this.currentUpdatingGraph
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
        point.attr({ x, y })
        this.stage.emitter.emit(events.REFRESH_SCREEN)
    }
    commitPolygon({ x, y }) {
        const polygon = this.currentUpdatingGraph
        if (!polygon) return
        polygon.points = polygon.points.filter((point) => !point.isPreviewPoint) // 删除所有预览点
        polygon.popPoint() // 因为dblclick也会触发mousedown事件，所有实际在mousedown时已经添加了两个点
        this.isDrawing = false
        this.currentUpdatingGraph = null
    }
    stop(type, position) {
        if (this.graphMode === 'polygon') {
            if (type === 'dblclick' && position) {
                return this.commitPolygon(position)
            } else return
        }
        this.isDrawing = false
        this.currentUpdatingGraph = null
    }
}
