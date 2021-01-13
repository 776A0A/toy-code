import Shape from './Shape'
import utils from '../utils'

class Circle extends Shape {
  constructor(props) {
    super(Object.assign({ center: [100, 100], r: 100, lineWidth: 1 }, props))
  }
  draw(ctx, osCtx) {
    super.draw(() => {
      const {
        center: [x, y],
        r,
        fillStyle,
        strokeStyle,
        lineWidth
      } = this.props

      utils.drawWithSave(
        ctx,
        ctx => {
          ctx.arc(x, y, r, 0, Math.PI * 2)
        },
        ctx => {
          ctx.lineWidth = lineWidth

          if (fillStyle) {
            ctx.fillStyle = fillStyle
            ctx.fill()
          }
          if (strokeStyle) {
            ctx.strokeStyle = strokeStyle
            ctx.stroke()
          }
        }
      )
      osCtx && this.drawOs(osCtx)
    })
  }
  drawOs(ctx) {
    const {
      center: [x, y],
      r,
      fillStyle,
      strokeStyle
    } = this.props

    super.drawOs(ctx, ctx => {
      ctx.arc(x, y, r, 0, Math.PI * 2)
    })
  }
}

export default Circle
