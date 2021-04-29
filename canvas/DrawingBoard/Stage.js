import { Display } from './Display.js'
import { EventEmitter } from './EventEmitter.js'
import { GraphManager } from './GraphManager.js'
import * as events from './events.js'
import { Circle, Picture, Point, Polygon, Rect, Text } from './Graphs/index.js'
import { Zoom } from './Zoom.js'

// TODO 增加八个控制点
// TODO 有些属性只提供只读接口，然后用户可使用preserve属性向其中添加自定义属性
// TODO 优化重复代码，例如很多方法中都要用到的那几行代码
// TODO wheel 整个放大缩小
// TODO 选择，框选
// TODO 优化使用插件的类的共有代码
// TODO cursor
// TODO import功能
// TODO 显示窗口resize问题
// TODO 撤销和重做
// TODO 旋转

const canvasDefaultConfig = {
    backgroundColor: '#fff',
    strokeColor: '#1890ff',
    fillColor: '#a0c5e8',
}

const LEFT_MOUSE_DOWN = 0

export const stageModes = {
    adder: 'adder',
    editor: 'editor',
}

export class Stage extends EventEmitter {
    mode = stageModes.adder
    plugins = new Set()
    zoom = true
    zoomer = new Zoom()
    constructor(canvas) {
        super()

        this.canvas = canvas
        this._display = new Display(canvas)
        this.graphManager = new GraphManager(this)

        if (!this.zoom) {
            this.zoomer = null
        } else {
            this.zoomer.install(this)
        }

        this.init()
    }
    init() {
        this.addListener()
    }
    setMode(mode) {
        this.mode = mode

        if (mode === stageModes.adder) {
            this.emit(events.END_EDIT)
        }

        return this
    }
    use(plugin) {
        if (this.plugins.has(plugin)) return
        this.plugins.add(plugin)
        plugin.install(this)
        return this
    }
    get handlers() {
        return {
            handleMouseDown: (evt) => {
                if (evt.button !== LEFT_MOUSE_DOWN) return

                const params = generateParams.call(this, evt, {
                    x: evt.offsetX,
                    y: evt.offsetY,
                })

                this.emit('mousedown', params)
            },
            handleMouseMove: (evt) => {
                const params = generateParams.call(this, evt, {
                    x: evt.offsetX,
                    y: evt.offsetY,
                })

                this.emit('mousemove', params)
            },
            handleMouseUp: (evt) => {
                const params = generateParams.call(this, evt)
                this.emit('mouseup', params)
            },
            handleMouseLeave: (evt) => {
                const params = generateParams.call(this, evt)
                this.emit('mouseleave', params)
            },
            handleDblClick: (evt) => {
                const params = generateParams.call(this, evt)
                this.emit('dblclick', params)
            },
            handleContextMenu: (evt) => {
                const params = generateParams.call(this, evt, {
                    x: evt.clientX,
                    y: evt.clientY,
                })
                this.emit('contextmenu', params)
            },
            handleWheel: (evt) => {
                const params = generateParams.call(this, evt)
                this.emit('wheel', params)
            },
        }
    }
    addListener() {
        this.on(this.canvas, 'mousedown', this.handlers.handleMouseDown)
            .on(this.canvas, 'mousemove', this.handlers.handleMouseMove)
            .on(this.canvas, 'mouseup', this.handlers.handleMouseUp)
            .on(this.canvas, 'mouseleave', this.handlers.handleMouseLeave)
            .on(this.canvas, 'dblclick', this.handlers.handleDblClick)
            .on(this.canvas, 'contextmenu', this.handlers.handleContextMenu)
            .on(this.canvas, 'wheel', this.handlers.handleWheel)
            .on(events.ADD_GRAPH, (graph, insertIndex) =>
                this.addGraph(graph, insertIndex)
            )
            .on(events.DELETE_GRAPH, (graph) => this.deleteGraph(graph))
            .on(events.REFRESH_SCREEN, () => this.display())
    }
    addGraph(graph, insertIndex) {
        this.graphManager.add(graph, insertIndex)
        return this
    }
    deleteGraph(graph) {
        this.graphManager.delete(graph)
    }
    display() {
        if (this.zoom) {
            const ctx = this.canvas.getContext('2d')
            const { target, scaleTotal } = this.zoomer
            ctx.save()
            ctx.translate(target.x, target.y)
            ctx.scale(scaleTotal, scaleTotal)
            this._display.refresh(this.graphManager.graphs)
            ctx.restore()
        } else {
            this._display.refresh(this.graphManager.graphs)
        }
    }
    import(graphs) {
        const constructorMap = {
            rect: Rect,
            polygon: Polygon,
            text: Text,
            circle: Circle,
            point: Point,
            picture: Picture,
        }
        const ctx = this.canvas.getContext('2d')
        let a = 0,
            b = 0

        const generate = (graphs, parent) => {
            graphs.forEach(({ attrs, name, children }) => {
                const constructor = constructorMap[name]

                if (name === 'picture') {
                    a++
                    const image = new Image()
                    image.src = attrs.image
                    image.crossOrigin = 'anonymous'
                    attrs.image = image
                    image.onload = () => b++
                }

                const graph = new constructor({ ctx, ...attrs })

                // BUG 导入后的文字不会跟随图形变化居中
                if (children.length) generate(children, graph)

                if (name === 'polygon') {
                    const points = attrs.points.map((point) => {
                        return new Point({ ctx, ...point.attrs })
                    })
                    graph.attr({ points }).updatePointsDiff()
                }

                if (parent) parent.appendChild(graph)
                else this.addGraph(graph)
            })
        }

        generate(graphs)

        const d = () => {
            if (a === b) this.display()
            else setTimeout(d, 50)
        }

        setTimeout(d, 50)
    }
    // TODO 导出数据中增加canvas的宽高
    export() {
        const graphs = this.graphManager.graphs
        const shakenGraphs = shake(graphs)
        return shakenGraphs

        function shake(graphs) {
            return graphs.map((graph) => {
                const { ctx, ...attrs } = graph.attrs

                const { name, children } = graph

                if (name === 'picture') attrs.image = attrs.image.src
                if (name === 'polygon')
                    attrs.points = attrs.points.map((point) => {
                        const { ctx, ...attrs } = point.attrs
                        const { name, children } = point

                        return { name, children, attrs }
                    })

                const obj = { attrs, name, children }

                if (children.length) obj.children = shake(obj.children)

                return obj
            })
        }
    }
}

function generateParams(evt, params) {
    return {
        type: evt.type,
        nativeEvent: evt,
        graphs: this.graphManager.graphs,
        ...params,
    }
}
