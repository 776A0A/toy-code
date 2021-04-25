import { Adder } from './adder.js'
import { Drawer } from './Drawer.js'
import { Editor } from './editor.js'
import { EventEmitter } from './eventEmitter.js'
import { ShapeBox } from './shapeBox.js'
import { Switcher, modes } from './switcher.js'

// TODO 右键二级菜单显示删除
// TODO 撤销和重做
// TODO 旋转
export class Stage {
    constructor(canvas) {
        this.canvas = canvas
        this.emitter = new EventEmitter()
        this.switcher = new Switcher(this)
        this.drawer = new Drawer(this)
        this.shapeBox = new ShapeBox(this)
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
            .listen('add-shape', (shape) => {
                this.shapeBox.add(shape)
            })
            .listen('update-screen', () => {
                this.drawer.update(this.shapeBox.shapes)
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
                this.editor.pick(position, this.shapeBox.shapes)
            }
        }
        const handleMouseMove = (evt) => {
            const position = { x: evt.offsetX, y: evt.offsetY }
            if (this.switcher.mode === modes.adder) {
                this.adder.update(position)
            } else if (this.switcher.mode === modes.editor) {
                this.editor.edit(position, this.shapeBox.shapes)
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
                this.adder.shapeMode === 'polygon'
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
                <ul>
                    <li id="deleteGraphButton" role="button">删除</li>
                </ul>
                `
                const handleClick = (evt) => {
                    if (evt.target.id === 'deleteGraphButton') {
                        this.shapeBox.remove(this.getEditingGraph())
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
    addShape(shape) {
        this.emitter.emit('add-shape', shape)
        return this
    }
    setMode(mode) {
        this.switcher.switchTo[mode]()
        return this
    }
    setShape(shape) {
        if (this.switcher.mode !== modes.adder) {
            throw Error('非绘制（adder）模式')
        }
        this.adder.switchTo[shape]()
    }
    getEditingGraph() {
        return this.shapeBox.shapes[this.editor.topGraphIndex]
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
