import Shape from './Shape'
import utils from '../utils'

class Rect extends Shape {
  constructor(props) {
    super(
      Object.assign(
        {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          fillStyle: 'red',
          shadowBlur: 0,
          shadowColor: 'red'
        },
        props
      )
    )
  }
  draw(ctx, osCtx) {
    super.draw(() => {
      const { x, y, width, height, alpha, fillStyle, shadowBlur, shadowColor } = this.props
      utils.drawWithSave(
        ctx,
        () => {
          ctx.rect(x, y, width, height)
        },
        () => {
          ctx.globalAlpha = alpha
          ctx.shadowBlur = shadowBlur
          ctx.shadowColor = shadowColor
          ctx.fillStyle = fillStyle
          ctx.fill()
        }
      )
      osCtx && this.drawOs(osCtx)
    })
  }
  drawOs(ctx) {
    super.drawOs(ctx, () => {
      const { x, y, width, height } = this.props
      ctx.rect(x, y, width, height)
    })
  }
}

export default Rect
