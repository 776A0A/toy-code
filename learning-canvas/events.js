const Events = {
  click: 'click',
  mousedown: 'mousedown',
  mousemove: 'mousemove',
  mouseup: 'mouseup',
  mouseenter: 'mouseenter',
  mouseleave: 'mouseleave'
}

class Base {
  constructor() {
    this.listeners = []
    this.id = createId()
  }
  draw(ctx, osCtx) {}
  on(type, cb) {
    if (this.listeners[type]) this.listeners[type].push(cb)
    else this.listeners[type] = [cb]
  }
}

class Rect extends Base {
  constructor(props) {
    super()
    const defaults = {
      fillColor: '#fff',
      strokeColor: '#000',
      strokeWidth: 1
    }
    this.props = Object.assign(defaults, props)
  }
  draw(ctx, osCtx) {
    const { x, y, width, height, strokeColor, strokeWidth, fillColor } = this.props

    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.fillStyle = fillColor
    ctx.rect(x, y, width, height)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    const rgba = idToRgba(this.id)
    osCtx.save()
    osCtx.beginPath()
    osCtx.strokeStyle = `rgba(${rgba.join()})`
    osCtx.fillStyle = `rgba(${rgba.join()})`
    osCtx.rect(x, y, width, height)
    osCtx.fill()
    osCtx.stroke()
    osCtx.restore()
  }
}

class Stage {
  constructor(canvas) {
    const dpr = window.devicePixelRatio
    canvas.width = 400 * dpr
    canvas.height = 400 * dpr
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.ctx.scale(dpr, dpr)
    this.dpr = dpr

    canvas.addEventListener('mousedown', this.handlerCreator(ActionType.down))
    canvas.addEventListener('mouseup', this.handlerCreator(ActionType.up))
    canvas.addEventListener('mousemove', this.handlerCreator(ActionType.move))

    this.osCanvas = new OffscreenCanvas(canvas.width, canvas.height)
    this.osCtx = this.osCanvas.getContext('2d')
    this.osCtx.scale(dpr, dpr)

    this.shapes = new Map()
    this.eventSimulator = new EventSimulator()
  }
  add(shape) {
    this.shapes.set(shape.id, shape)
    this.eventSimulator.addListeners(shape.id, shape.listeners)
    shape.draw(this.ctx, this.osCtx)
  }
  handlerCreator(type) {
    return evt => {
      const x = evt.offsetX
      const y = evt.offsetY
      const shape = this.getShape(x, y)
      if (!shape) return
      this.eventSimulator.addAction({ type, id: shape.id }, evt)
    }
  }
  getShape(x, y) {
    const rgba = Array.from(this.osCtx.getImageData(x * this.dpr, y * this.dpr, 1, 1).data)
    const id = rgbaToId(rgba)
    return this.shapes.get(id)
  }
}

const ids = {}

function createId() {
  let id = _createId()
  while (ids[id]) id = _createId()
  ids[id] = true
  return id
}
function _createId() {
  return Array(3)
    .fill(0)
    .map(() => Math.ceil(Math.random() * 255))
    .concat(255)
    .join('-')
}

function idToRgba(id) {
  return id.split('-')
}
function rgbaToId(rgba) {
  return rgba.join('-')
}

const ActionType = {
  down: 'down',
  up: 'up',
  move: 'move'
}

class EventSimulator {
  constructor() {
    this.listenersMap = {}
    this.lastDownId = undefined
    this.lastMoveId = undefined
  }
  addAction(action, evt) {
    const { type, id } = action
    if (type === ActionType.move) {
      this.fire(id, Events.mousemove, evt)
    }
    if (type === ActionType.move && (!this.lastMoveId || this.lastMoveId !== id)) {
      this.fire(id, Events.mouseenter, evt)
      this.fire(this.lastMoveId, Events.mouseleave, evt)
    }
    if (type === ActionType.down) {
      this.fire(id, Events.mousedown, evt)
    }
    if (type === ActionType.up) {
      this.fire(id, Events.mouseup, evt)
    }
    if (type === ActionType.up && this.lastDownId === id) {
      this.fire(id, Events.click, evt)
    }
    if (type === ActionType.move) {
      this.lastMoveId = id
    } else if (type === ActionType.down) {
      this.lastDownId = id
    }
  }
  addListeners(id, listeners) {
    this.listenersMap[id] = listeners
  }
  fire(id, event, evt) {
    this.listenersMap[id]?.[event]?.forEach(cb => cb(evt))
  }
}

const canvas = document.getElementById('c3')
const ctx = canvas.getContext('2d')

const stage = new Stage(canvas)

const rect = new Rect({ x: 10, y: 10, width: 100, height: 100 })

rect.on('click', e => {
  console.log('click')
})

stage.add(rect)
