import { Point } from './Graphs/index.js'
import { events } from './shared.js'
import { RectDrawer, PolygonDrawer } from './Drawer.js'
import { PluginHost } from './PluginHost.js'
import { stageModes } from './Stage.js'

export const adderModes = {
  rect: Symbol('rect'),
  polygon: Symbol('polygon'),
}
export class Adder extends PluginHost {
  stage = null
  mode = adderModes.rect
  drawers = new Map()
  drawer = null
  isDrawing = false
  plugins = new Set()
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
  cancel(evt) {
    if (
      evt.code.toLowerCase() === 'escape' &&
      this.isDrawing &&
      this.mode === adderModes.polygon
    ) {
      this.stage.emit(events.DELETE_GRAPH, this.drawer.graph).refresh()
      this.drawer.cancel()
      this.isDrawing = false
      this.drawer = null
    }
  }
  install(stage) {
    this.stage = stage

    stage
      .on({
        type: 'keyup',
        handler: ({ nativeEvent }) => check() && this.cancel(nativeEvent),
      })
      .on({
        type: 'mousedown',
        handler: ({ x, y }) => check() && this.add({ x, y }),
      })
      .on({
        type: 'mousemove',
        handler: ({ x, y }) => check() && this.update({ x, y }),
      })
      .on({ type: 'mouseup', handler: () => check() && this.commit() })
      .on({ type: 'mouseleave', handler: () => check() && this.commit() })
      .on({
        type: 'dblclick',
        handler: ({ type }) => check() && this.commit(type),
      })

    function check() {
      return stage.mode === stageModes.adder
    }
  }
}

export const adder = new Adder()

const rectDrawer = new RectDrawer()
const polygonDrawer = new PolygonDrawer()
adder.use(rectDrawer).use(polygonDrawer)
