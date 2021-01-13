import Shape from './Shape'
import utils from '../utils'

export const lineJoinValues = {
  miter: 'miter', // 直角
  round: 'round', // 圆角
  bevel: 'bevel' // 折线
}

export const lineCapValues = {
  butt: 'butt', // 直角
  round: 'round', // 圆角
  square: 'square' // 矩形
}

class Polyline extends Shape {
  constructor(props) {
    super(
      Object.assign(
        {
          points: [],
          fillStyle: 'red',
          lineJoin: lineJoinValues.miter,
          lineCap: lineCapValues.butt
        },
        props
      )
    )
  }
  draw(ctx, osCtx) {
    super.draw(() => {
      const { points, fillStyle, lineJoin, lineCap } = this.props
      const first = points.slice(0, 1)[0]
      if (!first) return
      utils.drawWithSave(
        ctx,
        ctx => this.drawPath(ctx, first),
        ctx => {
          ctx.lineJoin = lineJoin
          ctx.lineCap = lineCap
          ctx.fillStyle = fillStyle
          ctx.fill()
        }
      )
      osCtx && this.drawOs(osCtx)
    })
  }
  drawOs(ctx) {
    super.drawOs(ctx, () => {
      this.drawPath(ctx, this.props.points.slice(0, 1))
    })
  }
  drawPath(ctx, first) {
    ctx.moveTo(first[0], first[1])
    this.props.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y))
  }
}

export default Polyline
