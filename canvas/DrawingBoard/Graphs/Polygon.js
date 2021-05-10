import { Graph } from './Graph.js'

export class Polygon extends Graph {
  name = 'polygon'
  constructor({ points = [], ...rest } = {}) {
    super({ points, ...rest })
    this.injectParentToPoints()
  }
  attr(attrs = {}) {
    const _attrs = { ...attrs }

    if ('x' in attrs) this.attrs.x = _attrs.x
    if ('y' in attrs) this.attrs.y = _attrs.y
    delete _attrs.x
    delete _attrs.y

    Object.entries(_attrs).forEach(([k, v]) => (this._attrs[k] = v))

    return this
  }
  get attrs() {
    const firstPoint = this._attrs.points[0]
    return {
      ...this._attrs,
      get x() {
        return firstPoint.attrs.x
      },
      set x(x) {
        firstPoint.attr({ x })
      },
      get y() {
        return firstPoint.attrs.y
      },
      set y(y) {
        firstPoint.attr({ y })
      },
    }
  }
  /**
   * 因为多边形的点无法根据初始点x，y推算出来，所以每个点都需要记录和初始点x，y之间的位移。
   * 而点作为多边形的一部分不能和children重叠，如果重叠，那么clearChildren时就会无法分辨。
   * 所以添加一层injectParentToPoints和addPoint，对每个点进行处理（要跳过预览点）。
   */
  injectParentToPoints() {
    this.attrs.points.forEach((point) => this.setParentAndDiff(point, this))
  }
  addPoint(point) {
    if (!point.isPreviewPoint) {
      this.setParentAndDiff(point, this)
    }
    this.attrs.points.push(point)
  }
  // 当x，y改变后，需要更新diff
  updatePointsDiff() {
    this.injectParentToPoints()
    return this
  }
  popPoint() {
    return this.attrs.points.pop()
  }
  draw() {
    const { ctx, color } = this.attrs
    ctx.save()
    this.drawPath()
    ctx.strokeStyle = color
    this.fillIfNeeded()
    ctx.stroke()
    ctx.restore()
    this.drawChildren()
  }
  drawPath() {
    const {
      ctx,
      points: [_, ...points],
    } = this.attrs
    ctx.translate(...this.getTranslate())
    ctx.beginPath()
    ctx.moveTo(0, 0)
    points.forEach((point) => point.draw(this.attrs.x, this.attrs.y))
    ctx.closePath()
  }
}
