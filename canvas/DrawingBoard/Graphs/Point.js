import { Graph } from './Graph.js'

export class Point extends Graph {
  name = 'point'
  isPreviewPoint = false
  constructor({ x = 0, y = 0, ...rest }) {
    super({ x, y, ...rest })
  }
  draw(x = 0, y = 0) {
    const { ctx } = this.attrs
    ctx.save()
    this.drawPath(x, y)
    ctx.restore()
  }
  drawPath(x, y) {
    const { ctx } = this.attrs
    ctx.translate(-x, -y) // 回退父级的偏移
    ctx.translate(...this.getTranslate())
    ctx.lineTo(0, 0)
  }
}
