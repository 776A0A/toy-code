import { Graph } from './Graph.js'

export class Rect extends Graph {
  name = 'rect'
  constructor({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    lineWidth = 1,
    ...rest
  } = {}) {
    super({ x, y, width, height, lineWidth, ...rest })
  }
  draw() {
    const { ctx, lineWidth, color } = this.attrs
    ctx.save()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color
    this.drawPath()
    this.fillIfNeeded()
    ctx.stroke()
    ctx.restore()
    this.drawChildren()
  }
  drawPath() {
    const { ctx, width, height } = this.attrs
    ctx.translate(...this.getTranslate())
    ctx.beginPath()
    ctx.rect(0, 0, width, height)
    ctx.closePath()
  }
}
