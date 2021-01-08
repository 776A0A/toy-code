import EventSimulator from './EventSimulator'
import utils from './utils'
import OsCanvas from './OsCanvas'

export default class Stage {
  constructor(canvas) {
    setSize(canvas)
    this.shapes = []
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dpr = utils.setDpr(canvas)
    this.eventSimulator = new EventSimulator(this)
    this.osCanvas = new OsCanvas(canvas.width, canvas.height)
  }
  add(...shapes) {
    this.shapes.push(...shapes)
    return this
  }
  group(shapes) {
    this.shapes.push(shapes) // 保持数据的引用，不拆分传入的数组
    return this
  }
  remove(shape) {
    this.shapes = this.shapes.filter(s => s.id !== shape.id)
    return this
  }
  async draw(queue) {
    queue = queue || this.shapes
    const {
      ctx,
      osCanvas: { ctx: osCtx }
    } = this
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]
      if (Array.isArray(item)) await this.draw(item)
      else await item.draw(ctx, osCtx)
    }
    return this
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.osCanvas.clearRect()
    return this
  }
  emit(id, type, evt) {
    const find = arr => {
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        if (Array.isArray(item)) {
          const res = find(item)
          if (res) return res
        } else if (item.id === id) return item
      }
    }
    const shape = find(this.shapes)
    if (!shape) return
    shape.emit(type, evt, shape)
  }
}

function setSize(canvas) {
  const { width, height } = window.getComputedStyle(canvas)
  canvas.width = parseFloat(width)
  canvas.height = parseFloat(height)
}
