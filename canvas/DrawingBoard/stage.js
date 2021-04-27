import { Adder } from './Adder.js'
import { Display } from './Display.js'
import { Editor } from './Editor.js'
import { EventEmitter } from './EventEmitter.js'
import { GraphManager } from './GraphManager.js'
import { Switcher, modes } from './Switcher.js'
import { Scheduler } from './Scheduler.js'
import * as events from './events.js'
import * as utils from './utils.js'

// TODO 选择，框选
// TODO scheduler
// TODO cursor
// TODO import功能
// TODO 适配问题
// TODO resize问题
// TODO 撤销和重做
// TODO 旋转

const canvasDefaultConfig = {
    backgroundColor: '#fff',
    strokeColor: '#1890ff',
    fillColor: '#a0c5e8',
}

const LEFT_MOUSE_DOWN = 0

export class Stage extends EventEmitter {
    constructor(canvas, config = {}) {
        super()
        config = Object.assign(canvasDefaultConfig, config)
        this.canvas = canvas
        this.scheduler = new Scheduler()
        this.switcher = new Switcher(this)
        this.display = new Display(canvas)
        this.graphManager = new GraphManager(this)
        this.plugins = new Set()
        this.init()
    }
    init() {
        this.addNativeListener()
        this.addListener()
    }
    use(plugin) {
        if (this.plugins.has(plugin)) return
        this.plugins.add(plugin)
        plugin.install(this)
        return this
    }
    addListener() {
        this.on(events.ADD_GRAPH, (graph) => {
            this.graphManager.add(graph)
        })
            .on(events.REFRESH_SCREEN, () => {
                this.display.refresh(this.graphManager.graphs)
            })
            .on(events.DELETE_GRAPH, (graph) => {
                this.graphManager.delete(graph)
            })
    }
    addNativeListener() {
        const handleMouseDown = (evt) => {
            if (evt.button !== LEFT_MOUSE_DOWN) return

            const params = generateParams.call(this, evt, {
                x: evt.offsetX,
                y: evt.offsetY,
            })

            this.emit('mousedown', params)
        }
        const handleMouseMove = (evt) => {
            const params = generateParams.call(this, evt, {
                x: evt.offsetX,
                y: evt.offsetY,
            })

            this.emit('mousemove', params)
        }

        const handleMouseUp = (evt) => {
            const params = generateParams.call(this, evt)
            this.emit('mouseup', params)
        }
        const handleMouseLeave = (evt) => {
            const params = generateParams.call(this, evt)
            this.emit('mouseleave', params)
        }

        const handleDblClick = (evt) => {
            const params = generateParams.call(this, evt)
            this.emit('dblclick', params)
        }

        const handleContextMenu = (evt) => {
            const params = generateParams.call(this, evt, {
                x: evt.clientX,
                y: evt.clientY,
            })
            this.emit('contextmenu', params)
        }

        this.on(this.canvas, 'mousedown', handleMouseDown)
            .on(this.canvas, 'mousemove', handleMouseMove)
            .on(this.canvas, 'mouseup', handleMouseUp)
            .on(this.canvas, 'mouseleave', handleMouseLeave)
            .on(this.canvas, 'dblclick', handleDblClick)
            .on(this.canvas, 'contextmenu', handleContextMenu)
    }
    addGraph(graph) {
        this.emit(events.ADD_GRAPH, graph)
        return this
    }
    setMode(mode) {
        this.switcher.switchTo[mode]()
        return this
    }
    getGraphCenter(graph) {
        if (graph.name === 'rect') {
            const { x, y, width, height } = graph
            return [x + width / 2, y + height / 2]
        } else if (graph.name === 'polygon') {
            const center = utils.calculateCenter(
                graph.points.map(({ x, y }) => [x, y])
            )
            return center
        }
    }
    import(graphs) {}
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
