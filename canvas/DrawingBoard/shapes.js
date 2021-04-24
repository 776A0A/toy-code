class Graph {
    constructor(props = []) {
        this.name = 'graph'
        this.props = props
        this.children = []
        this.parent = null
        this.withParentDiff = { x: 0, y: 0 }
    }
    set(attrs) {
        Object.entries(attrs).forEach(([k, v]) => (this[k] = v))
    }
    appendChild(...graphs) {
        if (this.name === 'point') throw Error(`点作为基础绘制图形不会有子图形`)
        graphs.forEach((graph) => {
            graph.parent = this
            graph.withParentDiff = { x: graph.x - this.x, y: graph.y - this.y }
        })
        this.children.push(...graphs)
    }
    removeChild(...graphs) {
        this.children = this.children.filter((g) => !graphs.includes(g))
    }
    clearChildren() {
        this.children = []
    }
    draw() {}
    drawChildren() {
        if (this.children.length) {
            this.children.forEach((child) => child.draw())
        }
    }
    drawPath() {}
    clone() {
        return new this.constructor(...this.props)
    }
    getTranslate() {
        const { x, y } = this

        const currentWidthParentDiff = {
            x: this.parent ? x - this.parent.x : 0,
            y: this.parent ? y - this.parent.y : 0,
        }
        // BUG
        return [
            x + this.withParentDiff.x - currentWidthParentDiff.x,
            y + this.withParentDiff.y - currentWidthParentDiff.y,
        ]
    }
}
export class Rect extends Graph {
    constructor(...props) {
        super(props)
        const [ctx, x, y, width, height, lineWidth = 1, color = '#f00'] = props
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
        const { ctx, lineWidth, color } = this
        ctx.save()
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        this.drawPath()
        ctx.stroke()
        ctx.restore()
        this.drawChildren()
    }
    drawPath() {
        const { ctx, x, y, width, height } = this
        ctx.translate(x + this.withParentDiff.x, y + this.withParentDiff.y)
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.closePath()
    }
}
export class Circle extends Graph {
    constructor(...props) {
        super(props)
        const [ctx, x, y, r = 5, color = '#00f'] = props
        this.name = 'circle'
        this.ctx = ctx
        this.x = x
        this.y = y
        this.r = r
        this.color = color
    }
    draw() {
        const { ctx, color } = this
        ctx.save()
        this.drawPath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.restore()
        this.drawChildren()
    }
    drawPath() {
        const { ctx, r } = this
        ctx.translate(...this.getTranslate())
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, 2 * Math.PI)
        ctx.closePath()
    }
}
export class Text extends Graph {
    constructor(...props) {
        super(props)
        const [ctx, text, x, y, font = '20px sarif', color = '#000'] = props
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
export class Point extends Graph {
    constructor(...props) {
        super(props)
        const [ctx, x, y] = props
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
export class Polygon extends Graph {
    constructor(...props) {
        super(props)
        const [ctx, points = [], color = '#f00'] = props
        this.name = 'polygon'
        this.ctx = ctx
        this.points = points
        this.color = color
    }
    get x() {
        return this.points[0].x
    }
    get y() {
        return this.points[0].y
    }
    draw() {
        const { ctx, color } = this
        ctx.save()
        this.drawPath()
        ctx.strokeStyle = color
        ctx.stroke()
        ctx.restore()
        this.drawChildren()
    }
    drawPath() {
        const {
            ctx,
            points: [_, ...points],
        } = this
        ctx.translate(...this.getTranslate())
        ctx.beginPath()
        ctx.moveTo(0, 0)
        points.forEach((point) => point.draw())
        ctx.closePath()
    }
}
