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
        this.shapeBox = new ShapeBox()
        this.adder = new Adder(this)
        this.init()
    }
    init() {
        this.emitter
            .listen(this.canvas, 'mousedown', (evt) => {
                if (this.switcher.mode === modes.addMode) {
                    this.emitter.emit('adder-mousedown', evt)
                } else if (this.switcher.mode === modes.editMode) {
                    this.emitter.emit('editor-mousedown', evt)
                }
            })
            .listen(this.canvas, 'mousemove', (evt) => {
                if (this.switcher.mode === modes.addMode) {
                    this.emitter.emit('adder-mousemove', evt)
                } else if (this.switcher.mode === modes.editMode) {
                    this.emitter.emit('editor-mousemove', evt)
                }
            })
            .listen(this.canvas, 'mouseup', (evt) => {
                if (this.switcher.mode === modes.addMode) {
                    this.emitter.emit('adder-mouseup', evt)
                } else if (this.switcher.mode === modes.editMode) {
                    this.emitter.emit('editor-mouseup', evt)
                }
            })
            .listen(this.canvas, 'mouseleave', (evt) => {
                if (this.switcher.mode === modes.addMode) {
                    this.emitter.emit('adder-mouseleave', evt)
                } else if (this.switcher.mode === modes.editMode) {
                    this.emitter.emit('editor-mouseleave', evt)
                }
            })

        this.emitter.listen('add-shape', (shape) => {
            this.shapeBox.add(shape)
        })

        this.emitter.listen('mousedown', (evt) => {})
    }
    addShape(shape) {
        this.emitter.emit('add-shape', shape)
    }
    setMode(mode) {
        this.switcher.switchTo[mode]()
        return this
    }
    setShape(shape) {
        if (this.switcher.mode !== modes.addMode) {
            throw Error('非绘制（adder）模式')
        }
        this.adder.switchTo[shape]()
    }
}
