import Emitter from '../Emitter'
import utils from '../utils'
import { EventType } from '../EventSimulator'

// x，y可传入百分比，如 10%
class Shape extends Emitter {
  constructor(props = {}) {
    super()
    this.id = utils.unique.createId()
    this.data = props.data // 存放一些数据
    this.props = Object.assign(Object.create(null), { alpha: 1 }, props)
    this.stage = null
    this.normalized = false
    this.init()
  }
  draw(draw) {
    !this.normalized && this.normalizeXY()
    return draw()
  }
  drawOs(ctx, draw) {
    utils.drawWithSave(ctx, draw, () => {
      const rgba = utils.unique.idToRgba(this.id)
      ctx.fillStyle = `rgba(${rgba.join()})`
      ctx.fill()
    })
  }
  set(k, v) {
    if (k && typeof k === 'object') {
      Object.assign(this.props, k)
    } else {
      this.props[k] = v
    }
    return this
  }
  // TODO 动画
  animate() {}
  // 删除自身，暂时只能从绘制队列中删除
  remove() {
    this.stage.remove(this)
  }
  init() {
    const { clickable } = this.props
    // 显示手的鼠标形状
    if (clickable) {
      this.on('mouseenter', evt => {
        if (evt.origin) {
          evt.origin.target.style.cursor = 'pointer'
        }
      }).on('mouseout', evt => {
        if (evt.origin) {
          evt.origin.target.style.cursor = 'default'
        }
      })
    }
  }
  // 规范化x，y的值
  normalizeXY() {
    if (!this.stage) return

    this.normalized = true

    const {
      props: { x, y },
      stage: {
        canvas: { width, height }
      }
    } = this

    setConcertedValue.call(this, 'x', x, width)
    setConcertedValue.call(this, 'y', y, height)
  }
}

export default Shape

function setConcertedValue(valueName, value, base) {
  if (String(value).includes('%')) {
    const percent = parseFloat(value) / 100
    this.set(valueName, percent * base)
  }
}
