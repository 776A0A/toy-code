import Shape from './Shape'
import utils from '../utils'
import Text from './Text'

class Picture extends Shape {
  constructor(props) {
    super(Object.assign({ url: '', x: 0, y: 0 }, props))
  }
  draw(ctx, osCtx) {
    return super.draw(() => {
      const { url, x, y, width, height, alpha, text } = this.props
      return this.loadImage(url).then(image => {
        !width && (this.props.width = image.naturalWidth)
        !height && (this.props.height = image.naturalHeight)

        utils.drawWithSave(ctx, () => {
          ctx.globalAlpha = alpha
          ctx.drawImage(image, x, y, this.props.width, this.props.height)
          // TODO 需不需要让Shape继承Stage，使得每个shape都是一个小的stage？
          if (text) this.drawText(ctx)
        })

        osCtx && this.drawOs(osCtx)
      })
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
  drawText(ctx) {
    const { x, y, width, text: str } = this.props
    const text = new Text({
      text: str,
      x: x + width / 2,
      y: y + 45,
      fillStyle: '#fff',
      background: {
        color: 'hsl(35deg 84% 55% / 70%)',
        shadowBlur: 10,
        shadowColor: 'hsl(35deg 84% 55% / 100%)',
        paddingX: 16,
        paddingY: 4
      }
    })
    text.draw(ctx)
  }
}

export default Picture
