import Emitter from './Emitter'
import utils from './utils'

class Shape extends Emitter {
  constructor(props = {}) {
    super()
    this.id = utils.unique.createId()
    this.data = props.data // 存放一些数据
    this.props = Object.assign(Object.create(null), { alpha: 1 }, props)
  }
  draw(ctx, osCtx, draw) {
    throw Error('Must rewrite draw method.')
  }
  drawOs(ctx, draw) {
    utils.drawWithSave(ctx, draw, () => {
      const rgba = utils.unique.idToRgba(this.id)
      ctx.fillStyle = `rgba(${rgba.join()})`
      ctx.fill()
    })
  }
  set(k, v) {
    // 传入对象也是ok的
    if (k && typeof k === 'object') {
      Object.assign(this.props, k)
    } else {
      this.props[k] = v
    }
    return this
  }
  // TODO 动画
  animate() {}
}

class Rect extends Shape {
  constructor(props) {
    super(Object.assign({ x: 0, y: 0, width: 100, height: 100 }, props))
  }
  draw(ctx, osCtx) {
    utils.drawWithSave(
      ctx,
      () => {
        const { x, y, width, height, alpha } = this.props
        ctx.rect(x, y, width, height)
      },
      () => {
        ctx.globalAlpha = alpha
        ctx.fillStyle = 'red'
        ctx.fill()
      }
    )
    this.drawOs(osCtx)
  }
  drawOs(ctx) {
    super.drawOs(ctx, () => {
      const { x, y, width, height } = this.props
      ctx.rect(x, y, width, height)
    })
  }
}

class Picture extends Shape {
  constructor(props) {
    super(Object.assign({ url: '', x: 0, y: 0 }, props))
  }
  draw(ctx, osCtx) {
    const { url, x, y, width, height, alpha } = this.props
    return this.loadImage(url).then(image => {
      !width && (this.props.width = image.naturalWidth)
      !height && (this.props.height = image.naturalHeight)

      utils.drawWithSave(ctx, () => {
        ctx.globalAlpha = alpha
        ctx.drawImage(image, x, y, this.props.width, this.props.height)
      })

      this.drawOs(osCtx)
    })
  }
  drawOs(ctx) {
    super.drawOs(ctx, () => {
      const { x, y, width, height } = this.props
      ctx.rect(x, y, width, height)
    })
  }
  loadImage(url) {
    return new Promise(resolve => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.src = url
    })
  }
}

Shape.Rect = Rect
Shape.Picture = Picture

export default Shape
