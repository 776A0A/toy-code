import { EventEmitter } from '../EventEmitter.js'
import * as events from '../events.js'
import { merge } from '../utils.js'
export const DEFAULT_COLOR = '#1890ff'
export const DEFAULT_FILL_COLOR = '#a0c5e84f'
const defaultAttrs = { color: DEFAULT_COLOR, fillColor: false }

export // TODO 使用proxy重构，监听x，y的变化
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
