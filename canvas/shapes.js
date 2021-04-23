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
    constructor(ctx, x, y, w, h, lineWidth = 1, color = '#f00') {
        super()
        this.ctx = ctx
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.lineWidth = lineWidth
        this.color = color
    }
    draw() {
        const { ctx, x, y, w, h, lineWidth, color } = this
        ctx.save()
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.strokeRect(x, y, w, h)
        ctx.restore()
        if (this.children.length) {
            this.children.forEach((child) => child.draw(this))
        }
    }
    drawPath() {
        const { ctx, x, y, w, h } = this
        ctx.beginPath()
        ctx.rect(x, y, w, h)
        ctx.closePath()
    }
}
export class Circle extends Shape {
    constructor(ctx, x, y, r = 5, color = '#00f') {
        super()
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
        this.ctx = ctx
        this.x = x
        this.y = y
    }
    draw() {
        const { ctx, x, y } = this
        ctx.lineTo(x, y)
    }
}
export class Polygon extends Shape {
    constructor(ctx, points = []) {
        super()
        this.ctx = ctx
        this.points = points
    }
    draw() {
        const { ctx, points: _ } = this
        const points = [..._]
        const first = points[0]
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(first.x, first.y)
        points.slice(1).forEach((point) => point.draw())
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
    }
}
