import { Point, Polygon, Rect, DEFAULT_FILL_COLOR } from './Graph.js'
import * as events from './events.js'
import { DrawerGenerator } from './Drawer.js'

export class Adder {
    constructor(stage) {
        this.stage = stage
        this.canvas = stage.canvas
        this.graphMode = 'rect'
        this.currentDrawer = null
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
    add(offset) {
        if (this.graphMode === 'rect') {
            this.currentDrawer = DrawerGenerator.rect.generate({
                ctx: this.ctx,
                x: offset.x,
                y: offset.y,
                fillColor: DEFAULT_FILL_COLOR,
            })
        } else if (this.graphMode === 'polygon') {
            const point = new Point({
                ctx: this.ctx,
                x: offset.x,
                y: offset.y,
            })
            if (this.currentDrawer) {
                this.currentDrawer.addPoint(point)
            } else {
                this.currentDrawer = DrawerGenerator.polygon.generate({
                    ctx: this.ctx,
                    points: [point],
                    fillColor: DEFAULT_FILL_COLOR,
                })
            }
        } else {
            throw Error(`没有这个图形：${this.graphMode}`)
        }

        this.isDrawing = true
        this.stage.emitter.emit(events.ADD_GRAPH, this.currentDrawer.graph)
    }
    refresh(position) {
        if (!this.isDrawing || !this.currentDrawer) return

        this.currentDrawer.update(position)

        this.stage.emitter.emit(events.REFRESH_SCREEN)
    }
    commit(type) {
        if (this.graphMode === 'polygon') {
            if (type !== 'dblclick') return
            this.currentDrawer?.commit()
            this.isDrawing = false
            this.currentDrawer = null
            return
        }
        this.currentDrawer?.commit()
        this.isDrawing = false
        this.currentDrawer = null
    }
}
