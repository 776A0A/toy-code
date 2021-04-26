import { Point } from './Graph.js'
import * as events from './events.js'
import { drawerGenerator } from './Drawer.js'
import { Plugin } from './Plugin.js'

export class Adder extends Plugin {
    constructor() {
        super()
        this.stage = null
        this.graphMode = 'rect'
        this.drawer = null
        this.isDrawing = false
    }
    setMode(mode) {
        this.graphMode = mode
    }
    add({ x, y }) {
        const ctx = this.stage.canvas.getContext('2d')
        const baseAttrs = { ctx, x, y }
        if (this.graphMode === 'rect') {
            this.drawer = drawerGenerator.rect.generate({
                ...baseAttrs,
                fillColor: true,
            })
        } else if (this.graphMode === 'polygon') {
            const point = new Point({ ...baseAttrs })
            if (this.drawer) {
                this.drawer.addPoint(point)
            } else {
                this.drawer = drawerGenerator.polygon.generate({
                    ctx,
                    points: [point],
                    fillColor: true,
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
    install(stage) {
        this.stage = stage

        stage
            .on('mousedown', ({ x, y }) => check() && this.add({ x, y }))
            .on('mousemove', ({ x, y }) => check() && this.update({ x, y }))
            .on('mouseup', () => check() && this.commit())
            .on('mouseleave', () => check() && this.commit())
            .on('dblclick', ({ type }) => check() && this.commit(type))

        function check() {
            return stage.switcher.mode === 'adder'
        }
    }
}
