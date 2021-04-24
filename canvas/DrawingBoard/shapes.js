class Shape {
    constructor() {
        this.children = []
    }
    set(attrs) {
        Object.entries(attrs).forEach(([k, v]) => (this[k] = v))
    }
    appendChild(shape) {
        this.children.push(shape)
    }
    removeChild(shape) {
        this.children = this.children.filter((s) => s !== shape)
    }
    clearChildren() {
        this.children = []
    }
    draw() {}
    drawPath() {}
}
export class Rect extends Shape {
    constructor(ctx, x, y, width, height, lineWidth = 1, color = '#f00') {
        super()
        this.name = 'rect'
        this.ctx = ctx
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.lineWidth = lineWidth
        this.color = color
    }
    draw() {
        const { ctx, x, y, width, height, lineWidth, color } = this
        ctx.save()
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.strokeRect(x, y, width, height)
        ctx.restore()
        if (this.children.length) {
            this.children.forEach((child) => child.draw(this))
        }
    }
    drawPath() {
        const { ctx, x, y, width, height } = this
        ctx.beginPath()
        ctx.rect(x, y, width, height)
        ctx.closePath()
    }
}
export class Circle extends Shape {
    constructor(ctx, x, y, r = 5, color = '#00f') {
        super()
        this.name = 'circle'
        this.ctx = ctx
        this.x = x
        this.y = y
        this.r = r
        this.color = color
    }
    draw() {
        const { ctx, x, y, r, color } = this
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.restore()
    }
}
export class Text extends Shape {
    constructor(ctx, text, x, y, font = '20px sarif', color = '#000') {
        super()
        this.name = 'text'
        this.ctx = ctx
        this.text = text
        this.x = x
        this.y = y
        this.font = font
        this.color = color
    }
    draw() {
        const { ctx, text, x, y, font, color } = this
        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = font
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.fillText(text, x, y)
        ctx.closePath()
        ctx.restore()
    }
}
export class Point extends Shape {
    constructor(ctx, x, y) {
        super()
        this.name = 'point'
        this.ctx = ctx
        this.x = x
        this.y = y
    }
    draw() {
        this.drawPath()
    }
    drawPath() {
        const { ctx, x, y } = this
        ctx.lineTo(x, y)
    }
}
export class Polygon extends Shape {
    constructor(ctx, points = [], color = '#f00') {
        super()
        this.name = 'polygon'
        this.ctx = ctx
        this.points = points
        this.color = color
    }
    draw() {
        const { ctx, color } = this
        ctx.save()
        this.drawPath()
        ctx.strokeStyle = color
        ctx.stroke()
        ctx.restore()
    }
    drawPath() {
        const {
            ctx,
            points: [first, ...points],
        } = this
        ctx.beginPath()
        ctx.moveTo(first.x, first.y)
        points.forEach((point) => point.draw())
        ctx.closePath()
    }
}
