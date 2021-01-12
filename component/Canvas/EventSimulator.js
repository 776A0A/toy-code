const ActionType = {
  mousedown: 'mousedown',
  mouseup: 'mouseup',
  mousemove: 'mousemove'
}

export const EventType = {
  click: 'click',
  hover: 'hover',
  mouseenter: 'mouseenter',
  mouseout: 'mouseout',
  drew: 'drew'
}

export default class EventSimulator {
  constructor(ctx) {
    this.ctx = ctx
    this.lastDownId = null
    this.lastMoveId = null
    this.init()
  }
  init() {
    Object.keys(ActionType).forEach(type => this.listen(type))
  }
  trigger(id, type, evt) {
    if (type === ActionType.mousemove) {
      this.ctx.emit(id, EventType.hover, evt)
    }
    if (type === ActionType.mousemove && (!this.lastMoveId || this.lastMoveId !== id)) {
      this.ctx.emit(id, EventType.mouseenter, evt)
      this.ctx.emit(this.lastMoveId, EventType.mouseout, evt)
      this.lastMoveId = id
    }
    if (type === ActionType.mousedown) {
      this.lastDownId = id
    }
    if (type === ActionType.mouseup && this.lastDownId === id) {
      this.ctx.emit(id, EventType.click, evt)
      this.lastDownId = null
    }
  }
  listen(type) {
    this.ctx.canvas.addEventListener(type, evt => {
      const { offsetX, offsetY } = evt
      let shapeId = this.ctx.osCanvas.currentId(offsetX, offsetY)
      this.trigger(shapeId, type, evt)
    })
  }
}
