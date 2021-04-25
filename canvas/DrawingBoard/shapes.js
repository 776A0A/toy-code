import { EventEmitter } from './eventEmitter.js'

// TODO 使用proxy重构，监听x，y的变化
class Graph {
    constructor(props = {}) {
        this.emitter = new EventEmitter()
        this.name = 'graph'
        this.props = props
        this.children = []
        this.parent = null
        this.withParentDiff = { x: 0, y: 0 }
        this.parentListeners = []

        this.init()
    }
    init() {
        this.emitter.listen('removed-from-parent', () => {
            this.parentListeners.forEach(([type, cb]) => {
                this.parent.emitter.remove(type, cb)
            })
        })
    }
    listenParent(type, cb) {
        if (!this.parent) return
        this.parent.emitter.listen(type, cb)
        this.parentListeners.push([type, cb])
    }
    set(attrs = {}) {
        Object.entries(attrs).forEach(([k, v]) => (this[k] = v))
        // TODO 需不需要做事件派发？通知属性改变
        return this
    }
    appendChild(...graphs) {
        if (this.name === 'point') throw Error(`点作为基础绘制图形不会有子图形`)
        graphs.forEach((graph) => this.setParentAndDiff(graph, this))
        this.children.push(...graphs)
    }
    setParentAndDiff(graph, parent) {
        graph.parent = parent
        graph.withParentDiff = { x: graph.x - parent.x, y: graph.y - parent.y }
        return this
    }
    // 更新与父图形的diff，通常发生在改变了自身的x，y时
    updateParentAndDiff() {
        this.setParentAndDiff(this, this.parent)
        return this
    }
    // 更新所有子图形的diff，通常发生在改变了自身的x，y时
    updateChildrenDiff() {
        this.children.forEach((graph) => graph.setParentAndDiff(graph, this))
        return this
    }
    removeChild(...graphs) {
        this.children = this.children.filter((g) => {
            const includes = graphs.includes(g)
            if (includes) {
                g.emitter.emit('removed-from-parent')
                return false
            } else return true
        })
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
        return new this.constructor(this.props)
    }
    /**
     * 每一个图形的位移都是相对于整个画布的，通过记录最初和初始点的位移（该位移是不变的，除非拖拽了点），
     * 就可以在图形移动时根据这个最初位移和当前x，y的数值计算出正确的位移
     */
    getTranslate() {
        const { x, y } = this

        const currentWidthParentDiff = {
            x: this.parent ? x - this.parent.x : 0,
            y: this.parent ? y - this.parent.y : 0,
        }

        return [
            x + this.withParentDiff.x - currentWidthParentDiff.x,
            y + this.withParentDiff.y - currentWidthParentDiff.y,
        ]
    }
    fillIfNeeded() {
        const { ctx, fillColor } = this.props
        if (!fillColor) return
        ctx.fillStyle = fillColor
        ctx.fill()
    }
}
export class Rect extends Graph {
    constructor(props) {
        super(props)
        // TODO 将this.xx改为this.props.xx
        const {
            ctx,
            x,
            y,
            width,
            height,
            lineWidth = 1,
            color = '#f00',
        } = props
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
        this.fillIfNeeded()
        ctx.stroke()
        ctx.restore()
        this.drawChildren()
    }
    drawPath() {
        const { ctx, width, height } = this
        ctx.translate(...this.getTranslate())
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.closePath()
    }
}
export class Circle extends Graph {
    constructor(props) {
        super(props)
        const { ctx, x, y, r = 5, color = '#00f' } = props
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
        ctx.strokeStyle = color
        this.fillIfNeeded()
        ctx.stroke()
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
    constructor(props) {
        super(props)
        const { ctx, text, x, y, font = '20px sarif', color = '#000' } = props
        this.name = 'text'
        this.ctx = ctx
        this.text = text
        this.x = x
        this.y = y
        this.font = font
        this.color = color
    }
    draw() {
        const { ctx, text, font, color } = this
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
export class Point extends Graph {
    constructor(props) {
        super(props)
        const { ctx, x, y } = props
        this.name = 'point'
        this.ctx = ctx
        this.x = x
        this.y = y
    }
    draw() {
        const { ctx } = this
        ctx.save()
        this.drawPath()
        ctx.restore()
    }
    drawPath() {
        const { ctx } = this
        ctx.resetTransform()
        ctx.translate(...this.getTranslate())
        ctx.lineTo(0, 0)
    }
}
export class Polygon extends Graph {
    constructor(props) {
        super(props)
        const { ctx, points = [], color = '#f00' } = props
        this.name = 'polygon'
        this.ctx = ctx
        this.points = points
        this.color = color

        this.injectParentToPoints()
    }
    get x() {
        return this.points[0].x
    }
    set x(x) {
        this.points[0].x = x
    }
    get y() {
        return this.points[0].y
    }
    set y(y) {
        this.points[0].y = y
    }
    /**
     * 因为多边形的点无法根据初始点x，y推算出来，所以每个点都需要记录和初始点x，y之间的位移。
     * 而点作为多边形的一部分不能和children重叠，如果重叠，那么clearChildren时就会无法分辨。
     * 所以添加一层injectParentToPoints和addPoint，对每个点进行处理（要跳过预览点）。
     */
    injectParentToPoints() {
        this.points.forEach((point) => this.setParentAndDiff(point, this))
    }
    addPoint(point) {
        if (!point.isPreviewPoint) {
            this.setParentAndDiff(point, this)
        }
        this.points.push(point)
    }
    updatePointsDiff() {
        this.injectParentToPoints()
        return this
    }
    popPoint() {
        return this.points.pop()
    }
    draw() {
        const { ctx, color } = this
        ctx.save()
        this.drawPath()
        ctx.strokeStyle = color
        this.fillIfNeeded()
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
