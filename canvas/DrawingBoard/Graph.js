import { EventEmitter } from './EventEmitter.js'
import * as events from './events.js'
import { merge } from './utils.js'

export const DEFAULT_COLOR = '#1890ff'
export const DEFAULT_FILL_COLOR = '#a0c5e84f'
const defaultAttrs = { color: DEFAULT_COLOR, fillColor: false }

// TODO 使用proxy重构，监听x，y的变化
class Graph extends EventEmitter {
    name = 'graph'
    parent = null
    children = []
    withParentDiff = { x: 0, y: 0 }
    parentListeners = []
    staging = {}
    constructor(attrs = {}) {
        super()

        this._attrs = merge(defaultAttrs, attrs)

        this.init()
    }
    get attrs() {
        return this._attrs
    }
    init() {
        this.on(events.REMOVED_FROM_PARENT, () => {
            this.parentListeners.forEach(([type, cb]) => {
                this.parent.off(type, cb)
            })
        })
    }
    listenParent(type, cb) {
        if (!this.parent) return
        this.parent.on(type, cb)
        this.parentListeners.push([type, cb])
    }
    attr(attrs = {}) {
        Object.entries(attrs).forEach(([k, v]) => (this._attrs[k] = v))
        return this
    }
    appendChild(...graphs) {
        if (this.name === 'point') throw Error(`点作为基础绘制图形不会有子图形`)
        graphs.forEach((graph) => this.setParentAndDiff(graph, this))
        this.children.push(...graphs)
    }
    setParentAndDiff(graph, parent) {
        graph.parent = parent
        graph.withParentDiff = {
            x: graph.attrs.x - parent.attrs.x,
            y: graph.attrs.y - parent.attrs.y,
        }
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
        this.children = this.children.filter((graph) => {
            const includes = graphs.includes(graph)
            if (includes) {
                graph.emit(events.REMOVED_FROM_PARENT)
                return false
            } else return true
        })
    }
    destroy() {
        if (this.parent) {
            this.parent.removeChild(this)
        }
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
        return new this.constructor(this.attrs)
    }
    /**
     * 每一个图形的位移都是相对于整个画布的，通过记录最初和初始点的位移（该位移是不变的，除非拖拽了点），
     * 就可以在图形移动时根据这个最初位移和当前x，y的数值计算出正确的位移
     */
    getTranslate() {
        const { x, y } = this.attrs

        const currentWidthParentDiff = {
            x: this.parent ? x - this.parent.attrs.x : 0,
            y: this.parent ? y - this.parent.attrs.y : 0,
        }

        return [
            x + this.withParentDiff.x - currentWidthParentDiff.x,
            y + this.withParentDiff.y - currentWidthParentDiff.y,
        ]
    }
    fillIfNeeded() {
        const { ctx, fillColor } = this.attrs
        if (!fillColor) return
        ctx.fillStyle = fillColor === true ? DEFAULT_FILL_COLOR : fillColor
        ctx.fill()
    }
    // TODO 因为文字的原因，还需要增加判断是否在stroke上，可以在editor中增加方法抹平判断
    isInPath(x, y) {
        const { ctx } = this.attrs

        ctx.save()
        this.drawPath()
        ctx.restore()

        return ctx.isPointInPath(x, y)
    }
}
export class Rect extends Graph {
    name = 'rect'
    constructor({
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        lineWidth = 1,
        ...rest
    } = {}) {
        super({ x, y, width, height, lineWidth, ...rest })
    }
    draw() {
        const { ctx, lineWidth, color } = this.attrs
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
        const { ctx, width, height } = this.attrs
        ctx.translate(...this.getTranslate())
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.closePath()
    }
}
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
export class Text extends Graph {
    name = 'text'
    constructor({
        text,
        x = 0,
        y = 0,
        font = '20px sarif',
        color = '#000',
        ...rest
    } = {}) {
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
export class Point extends Graph {
    name = 'point'
    isPreviewPoint = false
    constructor({ x = 0, y = 0, ...rest }) {
        super({ x, y, ...rest })
    }
    draw(x = 0, y = 0) {
        const { ctx } = this.attrs
        ctx.save()
        this.drawPath(x, y)
        ctx.restore()
    }
    drawPath(x, y) {
        const { ctx } = this.attrs
        ctx.translate(-x, -y)
        ctx.translate(...this.getTranslate())
        ctx.lineTo(0, 0)
    }
}
export class Polygon extends Graph {
    name = 'polygon'
    constructor({ points = [], ...rest } = {}) {
        super({ points, ...rest })
        this.injectParentToPoints()
    }
    attr(attrs = {}) {
        const _attrs = { ...attrs }

        if ('x' in attrs) this.attrs.x = _attrs.x
        if ('y' in attrs) this.attrs.y = _attrs.y
        delete _attrs.x
        delete _attrs.y

        Object.entries(_attrs).forEach(([k, v]) => (this._attrs[k] = v))

        return this
    }
    get attrs() {
        const firstPoint = this._attrs.points[0]
        return {
            ...this._attrs,
            get x() {
                return firstPoint.attrs.x
            },
            set x(x) {
                firstPoint.attr({ x })
            },
            get y() {
                return firstPoint.attrs.y
            },
            set y(y) {
                firstPoint.attr({ y })
            },
        }
    }
    /**
     * 因为多边形的点无法根据初始点x，y推算出来，所以每个点都需要记录和初始点x，y之间的位移。
     * 而点作为多边形的一部分不能和children重叠，如果重叠，那么clearChildren时就会无法分辨。
     * 所以添加一层injectParentToPoints和addPoint，对每个点进行处理（要跳过预览点）。
     */
    injectParentToPoints() {
        this.attrs.points.forEach((point) => this.setParentAndDiff(point, this))
    }
    addPoint(point) {
        if (!point.isPreviewPoint) {
            this.setParentAndDiff(point, this)
        }
        this.attrs.points.push(point)
    }
    updatePointsDiff() {
        this.injectParentToPoints()
        return this
    }
    popPoint() {
        return this.attrs.points.pop()
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
        const {
            ctx,
            points: [_, ...points],
        } = this.attrs
        ctx.translate(...this.getTranslate())
        ctx.beginPath()
        ctx.moveTo(0, 0)
        points.forEach((point) => point.draw(this.attrs.x, this.attrs.y))
        ctx.closePath()
    }
}

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
        ctx.rect(0, 0, width, height)
    }
}
