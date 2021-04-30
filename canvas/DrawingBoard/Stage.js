import { Display } from './Display.js'
import { EventEmitter } from './EventEmitter.js'
import { GraphManager } from './GraphManager.js'
import { events, cursors } from './shared.js'
import { Circle, Picture, Point, Polygon, Rect, Text } from './Graphs/index.js'
import { VpController } from './VpController.js'

// TODO 选择，框选
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
    vpControl = true
    vpController = new VpController()
    cursor = cursors.crosshair
    constructor(canvas) {
        super()

        this.canvas = canvas
        this._display = new Display(canvas)
        this.graphManager = new GraphManager(this)

        if (!this.vpControl) {
            this.vpController = null
        } else {
            this.vpController.install(this)
        }

        this.init()
    }
    init() {
        this.addListener()
        this.setCursor(cursors.crosshair)
    }
    setMode(mode) {
        this.mode = mode

        if (mode === stageModes.adder) {
            this.emit(events.END_EDIT)
            this.setCursor(cursors.crosshair)
        } else this.setCursor(cursors.grab)

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

                const params = generateParams.call(
                    this,
                    evt,
                    this.vpController.getTransformedPosition(evt.offsetX, evt.offsetY)
                )

                if (this.vpController.isSpaceDown) this.vpController.handleMouseDown(params)
                else this.emit('mousedown', params)
            },
            handleMouseMove: (evt) => {
                const params = generateParams.call(
                    this,
                    evt,
                    this.vpController.getTransformedPosition(evt.offsetX, evt.offsetY)
                )

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
                const params = generateParams.call(
                    this,
                    evt,
                    this.vpController.getTransformedPosition(evt.clientX, evt.clientY)
                )

                this.emit('contextmenu', params)
            },
            handleWheel: (evt) => {
                const params = generateParams.call(this, evt)
                this.emit('wheel', params)
            },
            handleKeyDown: (evt) => {
                const params = generateParams.call(this, evt)
                this.emit('keydown', params)
            },
            handleKeyUp: (evt) => {
                const params = generateParams.call(this, evt)
                this.emit('keyup', params)
            },
        }
    }
    addListener() {
        this.on({
            elem: this.canvas,
            type: 'mousedown',
            handler: this.handlers.handleMouseDown,
        })
            .on({
                elem: this.canvas,
                type: 'mousemove',
                handler: this.handlers.handleMouseMove,
            })
            .on({
                elem: this.canvas,
                type: 'mouseup',
                handler: this.handlers.handleMouseUp,
            })
            .on({
                elem: this.canvas,
                type: 'mouseleave',
                handler: this.handlers.handleMouseLeave,
            })
            .on({
                elem: this.canvas,
                type: 'dblclick',
                handler: this.handlers.handleDblClick,
            })
            .on({
                elem: this.canvas,
                type: 'contextmenu',
                handler: this.handlers.handleContextMenu,
            })
            .on({
                elem: this.canvas,
                type: 'wheel',
                handler: this.handlers.handleWheel,
            })
            .on({
                elem: document,
                type: 'keydown',
                handler: this.handlers.handleKeyDown,
            })
            .on({
                elem: document,
                type: 'keyup',
                handler: this.handlers.handleKeyUp,
            })
            .on({
                type: events.ADD_GRAPH,
                handler: (graph, insertIndex) => this.addGraph(graph, insertIndex),
            })
            .on({
                type: events.DELETE_GRAPH,
                handler: (graph) => this.deleteGraph(graph),
            })
            .on({ type: events.REFRESH_SCREEN, handler: () => this.display() })
            .on({ type: events.CHANGE_CURSOR, handler: (cursor) => this.setCursor(cursor) })
    }
    addGraph(graph, insertIndex) {
        this.graphManager.add(graph, insertIndex)
        return this
    }
    deleteGraph(graph) {
        this.graphManager.delete(graph)

        return this
    }
    display() {
        if (this.vpControl) {
            this.vpController.scale(() => {
                this._display.refresh(this.graphManager.graphs)
            })
        } else {
            this._display.refresh(this.graphManager.graphs)
        }
        return this
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
                    const points = attrs.points.map((point) => new Point({ ctx, ...point.attrs }))
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
    setCursor(cursor) {
        if (!cursors) throw Error('请传入合法的 cursor 值！')

        if (cursor === cursors.crosshair) {
            if (this.mode === 'editor') cursor = cursors.grab
        }

        this.canvas.style.cursor = cursor
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
