import utils from './utils'
import unique from './unique'

export default class OsCanvas {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.canvas = new OffscreenCanvas(width, height)
    this.ctx = this.canvas.getContext('2d')
    this.dpr = utils.setDpr(this.canvas)
  }
  getShapeId(x, y) {
    const dpr = this.dpr
    const rgba = Array.from(this.ctx.getImageData(x * dpr, y * dpr, 1, 1).data)
    return unique.rgbaToId(rgba)
  }
  clearRect() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
}
