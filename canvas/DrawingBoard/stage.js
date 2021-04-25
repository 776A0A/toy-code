import { Adder } from './adder.js'
import { Drawer } from './Drawer.js'
import { Editor } from './editor.js'
import { EventEmitter } from './eventEmitter.js'
import { ShapeBox } from './shapeBox.js'
import { Switcher, modes } from './switcher.js'

// TODO 旋转
// TODO 添加文字
// TODO 右键点击撤销
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
                this.editor.end(this.shapeBox.shapes)
            })
    }
    addNativeListener() {
        const handleMouseDown = (evt) => {
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

        this.emitter
            .listen(this.canvas, 'mousedown', handleMouseDown)
            .listen(this.canvas, 'mousemove', handleMouseMove)
            .listen(this.canvas, 'mouseup', handleMouseUp)
            .listen(this.canvas, 'mouseleave', handleMouseLeave)
            .listen(this.canvas, 'dblclick', handleDblClick)
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
}
