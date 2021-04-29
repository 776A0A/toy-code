import { Graph } from './Graph.js'

export class Picture extends Graph {
    name = 'picture'
    constructor({
        image,
        x = 0,
        y = 0,
        width = image.naturalWidth,
        height = image.naturalHeight,
        ...rest
    } = {}) {
        super({ image, x, y, width, height, ...rest })
    }
    draw() {
        const { ctx, image, width, height } = this.attrs
        ctx.save()
        this.drawPath()
        ctx.drawImage(image, 0, 0, width, height)
        ctx.restore()
        this.drawChildren()
    }
    drawPath() {
        const { ctx, width, height } = this.attrs
        ctx.translate(...this.getTranslate())
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.closePath()
    }
}
