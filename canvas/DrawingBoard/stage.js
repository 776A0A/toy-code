import { Display } from './Display.js'
import { EventEmitter } from './EventEmitter.js'
import { GraphManager } from './GraphManager.js'
import * as events from './events.js'
import * as utils from './utils.js'

// TODO 增加八个控制点
// TODO 优化重复代码，例如很多方法中都要用到的那几行代码
// TODO wheel 整个放大缩小
// TODO 选择，框选
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
    constructor(canvas, config = {}) {
        super()
        config = Object.assign(canvasDefaultConfig, config)

        this.canvas = canvas
        this._display = new Display(canvas)
        this.graphManager = new GraphManager(this)

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
        }
    }
    addListener() {
        this.on(this.canvas, 'mousedown', this.handlers.handleMouseDown)
            .on(this.canvas, 'mousemove', this.handlers.handleMouseMove)
            .on(this.canvas, 'mouseup', this.handlers.handleMouseUp)
            .on(this.canvas, 'mouseleave', this.handlers.handleMouseLeave)
            .on(this.canvas, 'dblclick', this.handlers.handleDblClick)
            .on(this.canvas, 'contextmenu', this.handlers.handleContextMenu)
            .on(events.ADD_GRAPH, (graph, insertIndex) =>
                this.graphManager.add(graph, insertIndex)
            )
            .on(events.DELETE_GRAPH, (graph) => this.graphManager.delete(graph))
            .on(events.REFRESH_SCREEN, () =>
                this._display.refresh(this.graphManager.graphs)
            )
    }
    addGraph(graph, insertIndex) {
        this.emit(events.ADD_GRAPH, graph, insertIndex)
        return this
    }
    display() {
        this.emit(events.REFRESH_SCREEN)
    }
    import(graphs) {}
    // TODO 导出数据中增加canvas的宽高
    export() {
        const graphs = this.graphManager.graphs
        const shakenGraphs = shake(graphs)
        return shakenGraphs

        function shake(graphs) {
            return graphs.map((graph) => {
                const { ctx, ...attrs } = graph.attrs
                const { name, children, withParentDiff } = graph
                const obj = { attrs, name, children, withParentDiff }
                if (children.length) {
                    obj.children = shake(obj.children)
                }
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
