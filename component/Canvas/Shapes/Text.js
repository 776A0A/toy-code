import Shape from './Shape'
import utils from '../utils'
import Rect from './Rect'

class Text extends Shape {
  constructor(props) {
    super(Object.assign({ text: '文本', x: 0, y: 0, fillStyle: 'black', background: null }, props))
  }
  draw(ctx, osCtx) {
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
  }
  drawOs(ctx) {
    super.drawOs(ctx, () => {
      const { text, x, y, width, background = {} } = this.props
      let { x: bX, y: bY, paddingX = 16, paddingY = 4 } = background

      const rectWidth = Math.ceil(parseFloat(ctx.measureText(text).width)) + paddingX * 2

      bX = bX || x - (rectWidth - width) / 2
      bY = bY || y - 15

      ctx.rect(bX, bY, rectWidth, 14 + paddingY * 2)
    })
  }
  drawBackground(ctx) {
    const {
      text,
      background: { x, y, paddingX, paddingY, shadowBlur, shadowColor, color }
    } = this.props

    const rect = new Rect({
      x,
      y,
      width: Math.ceil(parseFloat(ctx.measureText(text).width)) + paddingX * 2,
      height: 14 + paddingY * 2,
      fillStyle: color,
      shadowBlur,
      shadowColor
    })
    rect.draw(ctx)
  }
}

export default Text
