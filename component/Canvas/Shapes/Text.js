import Shape from './Shape'
import utils from '../utils'
import Rect from './Rect'

class Text extends Shape {
  constructor(props) {
    super(Object.assign({ text: '文本', x: 0, y: 0, fillStyle: 'black', background: null }, props))
  }
  draw(ctx, osCtx) {
    super.draw(() => {
      const { text, x, y, fillStyle, background } = this.props

      utils
        .drawWithSave(ctx, ctx => {
          if (background) this.drawBackground(ctx)
        })
        .drawWithSave(ctx, ctx => {
          ctx.font = '14px/1 serif'
          ctx.fillStyle = fillStyle
          ctx.textAlign = 'center'
          ctx.fillText(text, x, y)
        })

      osCtx && this.drawOs(osCtx)
    })
  }
  drawOs(ctx) {
    super.drawOs(ctx, () => {
      const { x, y, width, height } = this.getBackgroundInfo(ctx)
      ctx.rect(x, y, width, height)
    })
  }
  drawBackground(ctx) {
    const { shadowBlur, shadowColor, color } = this.props.background

    const rect = new Rect({
      ...this.getBackgroundInfo(ctx),
      fillStyle: color,
      shadowBlur,
      shadowColor
    })
    rect.draw(ctx)
  }
  getTextSize(ctx) {
    const { width, fontBoundingBoxAscent, fontBoundingBoxDescent } = ctx.measureText(
      this.props.text
    )
    return { width, height: fontBoundingBoxAscent + fontBoundingBoxDescent }
  }
  getBackgroundInfo(ctx) {
    const {
      x,
      y,
      background: { paddingX, paddingY }
    } = this.props
    const { width, height } = this.getTextSize(ctx)
    return {
      x: x - paddingX - width / 2,
      y: y - paddingY - height / 2 - 4,
      width: width + paddingX * 2,
      height: 14 + paddingY * 2
    }
  }
}

export default Text
