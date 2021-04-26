import { Point, DEFAULT_FILL_COLOR } from './Graph.js'
import * as events from './events.js'
import { DrawerGenerator } from './Drawer.js'

export class Adder {
    constructor(stage) {
        this.stage = stage
        this.canvas = stage.canvas
        this.graphMode = 'rect'
        this.drawer = null
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
            this.drawer = DrawerGenerator.rect.generate({
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
            if (this.drawer) {
                this.drawer.addPoint(point)
            } else {
                this.drawer = DrawerGenerator.polygon.generate({
                    ctx: this.ctx,
                    points: [point],
                    fillColor: DEFAULT_FILL_COLOR,
                })
            }
        } else {
            throw Error(`没有这个图形：${this.graphMode}`)
        }

        this.isDrawing = true
        this.stage.emit(events.ADD_GRAPH, this.drawer.graph)
    }
    update(position) {
        if (!this.isDrawing || !this.drawer) return

        this.drawer.update(position)

        this.stage.emit(events.REFRESH_SCREEN)
    }
    commit(type) {
        if (this.graphMode === 'polygon') {
            if (type !== 'dblclick') return
            this.drawer?.commit()
            this.isDrawing = false
            this.drawer = null
            return
        }
        this.drawer?.commit()
        this.isDrawing = false
        this.drawer = null
    }
}
