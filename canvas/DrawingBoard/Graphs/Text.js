import { Graph } from './Graph.js'

export class Text extends Graph {
    name = 'text'
    constructor({ text, x = 0, y = 0, font = '20px sarif', color = '#000', ...rest } = {}) {
        super({ text, x, y, font, color, ...rest })
    }
    draw() {
        const { ctx, text, font, color } = this.attrs
        ctx.save()
        ctx.translate(...this.getTranslate())
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = font
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.fillText(text, 0, 0)
        ctx.closePath()
        ctx.restore()
    }
}
