import { Adder } from './adder.js'
import { Drawer } from './Drawer.js'
import { EventEmitter } from './eventEmitter.js'
import { ShapeBox } from './shapeBox.js'
import { Switcher, modes } from './switcher.js'

export class Stage {
    constructor(canvas) {
        this.canvas = canvas
        this.emitter = new EventEmitter()
        this.switcher = new Switcher()
        this.drawer = new Drawer(this)
        this.shapeBox = new ShapeBox(this)
        this.adder = new Adder(this)
        this.init()
    }
    init() {
        this.addNativeListener()
        this.addListener()
    }
    addListener() {
        this.emitter.listen('add-shape', (shape) => {
            this.shapeBox.add(shape)
        })

        this.emitter.listen('update-screen', () => {
            this.drawer.update(this.shapeBox.shapes)
        })
    }
    addNativeListener() {
        const handleMouseDown = (evt) => {
            const position = { x: evt.offsetX, y: evt.offsetY }
            if (this.switcher.mode === modes.adder) {
                this.adder.add(position)
            } else if (this.switcher.mode === modes.editor) {
                this.emitter.emit('editor-mousedown', evt)
            }
        }
        const handleMouseMove = (evt) => {
            const position = { x: evt.offsetX, y: evt.offsetY }
            if (this.switcher.mode === modes.adder) {
                this.adder.update(position)
            } else if (this.switcher.mode === modes.editor) {
                this.emitter.emit('editor-mousemove', evt)
            }
        }
        const handleMouseUp = (evt) => {
            if (this.switcher.mode === modes.adder) {
                this.adder.stop()
            } else if (this.switcher.mode === modes.editor) {
                this.emitter.emit('editor-mouseup', evt)
            }
        }
        const handleMouseLeave = (evt) => {
            if (this.switcher.mode === modes.adder) {
                this.adder.stop()
            } else if (this.switcher.mode === modes.editor) {
                this.emitter.emit('editor-mouseleave', evt)
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
