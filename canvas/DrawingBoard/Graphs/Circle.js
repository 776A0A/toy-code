import { Graph } from './Graph.js'

export class Circle extends Graph {
    name = 'circle'
    constructor({ x = 0, y = 0, r = 5, ...rest } = {}) {
        super({ x, y, r, ...rest })
    }
    draw() {
        const { ctx, color } = this.attrs
        ctx.save()
        this.drawPath()
        ctx.strokeStyle = color
        this.fillIfNeeded()
        ctx.stroke()
        ctx.restore()
        this.drawChildren()
    }
    drawPath() {
        const { ctx, r } = this.attrs
        ctx.translate(...this.getTranslate())
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, 2 * Math.PI)
        ctx.closePath()
    }
}
