import { Point } from './Graphs/index.js'
import * as events from './events.js'
import { RectDrawer, PolygonDrawer } from './Drawer.js'
import { Plugin } from './Plugin.js'

export const adderModes = {
    rect: Symbol('rect'),
    polygon: Symbol('polygon'),
}
export class Adder extends Plugin {
    stage = null
    mode = adderModes.rect
    drawers = new Map()
    drawer = null
    isDrawing = false
    plugins = new Set()
    use(plugin) {
        if (this.plugins.has(plugin)) return
        this.plugins.add(plugin)
        plugin.install(this)
        return this
    }
    injectDrawer(name, drawer) {
        if (this.drawers.has(drawer)) return
        this.drawers.set(name, drawer)
    }
    setMode(mode) {
        this.mode = mode
    }
    add({ x, y }) {
        const ctx = this.stage.canvas.getContext('2d')
        const baseAttrs = { ctx, x, y }

        if (this.mode === adderModes.rect) {
            this.drawer = this.drawers.get('rect').generate({
                ...baseAttrs,
                fillColor: true,
            })
        } else if (this.mode === adderModes.polygon) {
            const point = new Point({ ...baseAttrs })
            if (this.drawer) {
                this.drawer.addPoint(point)
            } else {
                this.drawer = this.drawers.get('polygon').generate({
                    ctx,
                    points: [point],
                    fillColor: true,
                })
            }
        } else {
            throw Error(`没有这个图形：${this.mode}`)
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
        if (this.mode === adderModes.polygon) {
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
            return stage.mode === 'adder'
        }
    }
}

export const adder = new Adder()

const rectDrawer = new RectDrawer()
const polygonDrawer = new PolygonDrawer()
adder.use(rectDrawer).use(polygonDrawer)
