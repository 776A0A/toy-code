import { Plugin } from '../Plugin.js'
import { ControlPoint } from './ControlPoint.js'
import { getDistance } from '../utils.js'
import * as quadrangleHandlers from './quadrangleHandlers.js'
import { Menu } from './Menu.js'

export class Transformer extends Plugin {
    name = 'transformer'
    editor = null
    graph = null
    dragPosition = { x: 0, y: 0 }
    controller = null
    menu = null
    install(editor) {
        this.editor = editor
        editor.injectTransformer(this.graphName, this)
    }
    generate(graph, dragPosition) {
        this.graph = graph
        this.dragPosition = dragPosition // 记录拖拽鼠标位置
        this.controller = new ControlPoint(graph)
        return this
    }
    delete() {}
    handleContextmenu({ x, y }) {
        if (!this.isInPath({ x, y }) || this.menu) return
        this.menu = new Menu({ x, y }, this.editor, this)
        this.menu.append()
    }
    end() {
        this.controller.clearPoints() // 清除控制点
    }
    isPicked(position) {
        const points = this.controller.points
        return (this.controller.pickedIndex = points.findIndex((circle) => {
            const [x, y] = circle.getTranslate()
            return getDistance({ x, y }, position) <= circle.attrs.r
        }))
    }
    isInPath({ x, y }) {
        const {
            left,
            top,
        } = this.graph.attrs.ctx.canvas.getBoundingClientRect()

        return this.graph.isInPath(x - left, y - top)
    }
    getDiff({ x, y }) {
        return {
            x: x - this.dragPosition.x,
            y: y - this.dragPosition.y,
        }
    }
    start() {
        quadrangleHandlers.quadrangleStart.call(this)
    }
    resize({ x, y }) {
        quadrangleHandlers.quadrangleResize.call(this, { x, y })
    }
    drag({ x, y }) {
        quadrangleHandlers.quadrangleDrag.call(this, { x, y })
    }
}
