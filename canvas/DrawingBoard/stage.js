import { Adder } from './adder.js'
import { Display } from './Display.js'
import { Editor } from './editor.js'
import { EventEmitter } from './eventEmitter.js'
import { GraphManager } from './GraphManager.js'
import { Switcher, modes } from './switcher.js'

// TODO scheduler
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
export class Stage {
    constructor(canvas, config = {}) {
        config = Object.assign(canvasDefaultConfig, config)
        this.canvas = canvas
        this.emitter = new EventEmitter()
        this.switcher = new Switcher(this)
        this.display = new Display(this)
        this.graphManager = new GraphManager(this)
        this.adder = new Adder(this)
        this.editor = new Editor(this)
        this.init()
    }
    init() {
        this.addNativeListener()
        this.addListener()
    }
    addListener() {
        this.emitter
            .listen('add-graph', (graph) => {
                this.graphManager.add(graph)
            })
            .listen('update-screen', () => {
                this.display.update(this.graphManager.graphs)
            })
            .listen('end-edit', () => {
                this.editor.end()
            })
    }
    addNativeListener() {
        const handleMouseDown = (evt) => {
            if (evt.button !== 0) return
            this.removeMenuIfHas()
            const position = { x: evt.offsetX, y: evt.offsetY }
            if (this.switcher.mode === modes.adder) {
                this.adder.add(position)
            } else if (this.switcher.mode === modes.editor) {
                this.editor.pick(position, this.graphManager.graphs)
            }
        }
        const handleMouseMove = (evt) => {
            const position = { x: evt.offsetX, y: evt.offsetY }
            if (this.switcher.mode === modes.adder) {
                this.adder.update(position)
            } else if (this.switcher.mode === modes.editor) {
                this.editor.edit(position, this.graphManager.graphs)
            }
        }

        let handleMouseUp, handleMouseLeave
        handleMouseUp = handleMouseLeave = (evt) => {
            if (this.switcher.mode === modes.adder) {
                this.adder.stop()
            } else if (this.switcher.mode === modes.editor) {
                this.editor.stop()
            }
        }

        const handleDblClick = (evt) => {
            const position = { x: evt.offsetX, y: evt.offsetY }
            if (
                this.switcher.mode === modes.adder &&
                this.adder.graphMode === 'polygon'
            ) {
                this.adder.stop('dblclick', position)
            }
        }

        const handleContextMenu = (evt) => {
            if (this.switcher.mode === modes.editor) {
                evt.preventDefault()
                const graph = this.getEditingGraph()
                if (!graph) return

                const { clientX, clientY } = evt

                const menu = document.createElement('div')
                menu.id = 'canvas-editor-menu'
                Object.assign(menu.style, {
                    position: 'fixed',
                    left: clientX + 'px',
                    top: clientY + 'px',
                    userSelect: 'none',
                })
                const content = `
                <ul style="padding: 0; list-style: none;">
                    <li id="deleteGraphButton" role="button"
                    style="
                    border: 1px solid #aaa;
                    padding: 0px 12px;
                    cursor: pointer;
                    background: #fff;
                    ">
                    删除
                    </li>
                </ul>
                `
                const handleClick = (evt) => {
                    if (evt.target.id === 'deleteGraphButton') {
                        this.graphManager.remove(this.getEditingGraph())
                        this.editor.delete()
                        this.emitter.emit('update-screen')
                        menu.removeEventListener('click', handleClick)
                        menu.remove()
                    }
                }
                menu.handleClick = handleClick
                menu.addEventListener('click', handleClick)
                menu.innerHTML = content
                document.body.append(menu)
            }
        }

        this.emitter
            .listen(this.canvas, 'mousedown', handleMouseDown)
            .listen(this.canvas, 'mousemove', handleMouseMove)
            .listen(this.canvas, 'mouseup', handleMouseUp)
            .listen(this.canvas, 'mouseleave', handleMouseLeave)
            .listen(this.canvas, 'dblclick', handleDblClick)
            .listen(this.canvas, 'contextmenu', handleContextMenu)
    }
    addGraph(graph) {
        this.emitter.emit('add-graph', graph)
        return this
    }
    setMode(mode) {
        this.switcher.switchTo[mode]()
        return this
    }
    setGraph(graph) {
        if (this.switcher.mode !== modes.adder) {
            throw Error('非绘制（adder）模式')
        }
        this.adder.switchTo[graph]()
    }
    getEditingGraph() {
        return this.graphManager.graphs[this.editor.topGraphIndex]
    }
    getGraphCenter(graph) {
        if (graph.name === 'rect') {
            const { x, y, width, height } = graph
            return [x + width / 2, y + height / 2]
        } else if (graph.name === 'polygon') {
            const center = calculateCenter(
                graph.points.map(({ x, y }) => [x, y])
            )
            return center
        }
    }
    removeMenuIfHas() {
        const menu = document.getElementById('canvas-editor-menu')
        if (!menu) return
        menu.removeEventListener('click', menu.handleClick)
        menu.remove()
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

function calculateCenter(points) {
    let sum_x = 0
    let sum_y = 0
    let sum_area = 0
    let point = points[1]
    for (let i = 2; i < points.length; i++) {
        const _point = points[i]
        const area = calcArea(points[0], point, _point)
        sum_area += area
        sum_x += (points[0][0] + point[0] + _point[0]) * area
        sum_y += (points[0][1] + point[1] + _point[1]) * area
        point = _point
    }
    return [sum_x / sum_area / 3, sum_y / sum_area / 3]
}
function calcArea(p0, p1, p2) {
    return (
        (p0[0] * p1[1] +
            p1[0] * p2[1] +
            p2[0] * p0[1] -
            p1[0] * p0[1] -
            p2[0] * p1[1] -
            p0[0] * p2[1]) /
        2
    )
}
