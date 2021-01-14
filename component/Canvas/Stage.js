import EventSimulator, { EventType } from './EventSimulator'
import utils from './utils'
import OsCanvas from './OsCanvas'
import Emitter from './Emitter'

let uid = 0

const lifecycle = {
  created: 'created',
  beforeDraw: 'beforeDraw',
  afterDraw: 'afterDraw'
}

export default class Stage extends Emitter {
  constructor(canvas, from) {
    super()
    setSize(canvas)
    this.id = uid++
    this.from = from
    this.shapes = []
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dpr = utils.setDpr(canvas)
    this.eventSimulator = new EventSimulator(this)
    this.osCanvas = new OsCanvas(canvas.width, canvas.height)
    this.copyCache = new Map()

    callHook.call(this, lifecycle.created)
  }
  add(...shapes) {
    shapes.forEach(s => {
      if (Array.isArray(s)) s.forEach(s => s.extend(this))
      else s.extend(this)
      !this.has(s) && this.shapes.push(s)
    })
    return this
  }
  has(item) {
    return this.shapes.includes(item)
  }
  group(shapes) {
    return this.add(shapes) // 保持数据的引用，不拆分传入的数组
  }
  remove(shape) {
    if (!shape) {
      this.shapes = []
    } else {
      this.shapes = this.shapes.filter(s => s.id !== shape.id)
    }
    return this
  }
  async draw(queue) {
    callHook.call(this, lifecycle.beforeDraw)

    queue = queue || this.shapes
    const {
      ctx,
      osCanvas: { ctx: osCtx }
    } = this
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]
      if (Array.isArray(item) /* 递归调用draw方法 */) await this.draw(item)
      else await item.draw(ctx, osCtx)
    }

    callHook.call(this, lifecycle.afterDraw)
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
        // 如果是在group中，递归寻找
        if (Array.isArray(item)) {
          const res = find(item)
          if (res) return res
        } else if (item.id === id) return item
      }
    }
    const shape = find(this.shapes)

    shape?.emit(type, utils.createEvent({ type, origin: evt, current: shape, stage: this, id }))
    super.emit(type, utils.createEvent({ type, origin: evt, current: this, stage: this, id }))
  }
  copy(idx) {
    if (idx == null) {
      return this.copyStage(uid++)
    } else {
      const stage = this.copyCache.get(idx)
      if (stage) {
        this.canvas.parentNode.append(stage.canvas)
        return stage
      } else return this.copyStage(idx)
    }
  }
  copyStage(idx) {
    const canvas = this.canvas.cloneNode()
    canvas.setAttribute('id', `copy-canvas-${idx}`)
    canvas.style.cursor = 'default'
    this.canvas.parentNode.append(canvas)
    const stage = new Stage(canvas, this)
    this.copyCache.set(idx, stage)
    return stage
  }
  top() {
    let current = this
    let from = current.from
    while (from) {
      current = from
      from = from.from
    }
    return current
  }
}

function setSize(canvas) {
  const { width, height } = window.getComputedStyle(canvas)
  canvas.width = parseFloat(width)
  canvas.height = parseFloat(height)
}

function callHook(type) {
  this.emit(
    type,
    utils.createEvent({ type, origin: null, current: this, stage: this, id: this.id })
  )
}
