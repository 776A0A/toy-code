import * as events from './events.js'
import { Circle, DEFAULT_COLOR } from './Graph.js'
import { Plugin } from './Plugin.js'

class Transformer extends Plugin {
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
    start() {}
    resize() {}
    drag() {}
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
        const { left, top } = this.graph.ctx.canvas.getBoundingClientRect()

        return this.graph.isInPath(x - left, y - top)
    }
    getDiff({ x, y }) {
        return {
            x: x - this.dragPosition.x,
            y: y - this.dragPosition.y,
        }
    }
}

export class RectTransformer extends Transformer {
    name = 'rectTransformer'
    graphName = 'rect'
    start() {
        if (this.controller.pickedIndex === -1) return

        const { pickedIndex, points } = this.controller

        const diagonalPoint = points[(pickedIndex + 2) % points.length]

        const [x, y] = diagonalPoint.getTranslate()

        this.graph.attr({ x, y }).updateChildrenDiff()
    }
    drag({ x, y }) {
        const diff = this.getDiff({ x, y })

        const graph = this.graph

        graph.attr({
            x: graph.attrs.x + diff.x,
            y: graph.attrs.y + diff.y,
        })
        this.controller.updatePoints()

        this.dragPosition = { x, y }
    }
    resize({ x, y }) {
        this.graph.attr({
            width: x - this.graph.attrs.x,
            height: y - this.graph.attrs.y,
        })
        this.controller.updatePoints()
        this.graph.emit(events.SIZE_CHANGED)
    }
}

export class PolygonTransformer extends Transformer {
    name = 'polygonTransformer'
    graphName = 'polygon'
    drag({ x, y }) {
        const diff = this.getDiff({ x, y })

        // TODO 建立point的x，y和polygon的x，y之间的关系，使得不用更新每一个point的属性，也就是说point的坐标可以通过计算得出
        this.graph.attrs.points.forEach((point) =>
            point.attr({
                x: point.attrs.x + diff.x,
                y: point.attrs.y + diff.y,
            })
        )
        this.controller.updatePoints()

        this.dragPosition = { x, y }
    }
    resize(position) {
        // TODO 只要更新了自身的坐标，就要运行updatePointsDiff和updateChildrenDiff
        if (this.controller.pickedIndex === 0) {
            this.graph.attr(position).updatePointsDiff().updateChildrenDiff()
        } else {
            this.graph.attrs.points[this.controller.pickedIndex]
                ?.attr(position)
                .updateParentAndDiff()
        }
        this.controller.updatePoints(position)
        this.graph.emit(events.SIZE_CHANGED)
    }
}

export class PictureTransformer extends Transformer {
    name = 'pictureTransformer'
    graphName = 'picture'
    start() {
        if (this.controller.pickedIndex === -1) return

        const { pickedIndex, points } = this.controller

        const diagonalPoint = points[(pickedIndex + 2) % points.length]

        const [x, y] = diagonalPoint.getTranslate()

        this.graph.attr({ x, y }).updateChildrenDiff()
    }
    drag({ x, y }) {
        const diff = this.getDiff({ x, y })

        this.graph.attr({
            x: this.graph.attrs.x + diff.x,
            y: this.graph.attrs.y + diff.y,
        })

        this.controller.updatePoints()

        this.dragPosition = { x, y }
    }
    resize({ x, y }, pickedIndex) {
        this.graph.attr({
            width: x - this.graph.attrs.x,
            height: y - this.graph.attrs.y,
        })
        this.controller.updatePoints()
        this.graph.emit(events.SIZE_CHANGED)
    }
}

class ControlPoint {
    r = 10
    points = []
    pickedIndex = -1
    constructor(graph) {
        this.graph = graph
        this.addPoints()
    }
    addPoints() {
        this.pointGenerators[this.graph.name]()
        this.graph.appendChild(...this.points)
    }
    clearPoints() {
        this.graph.removeChild(...this.points)
    }
    updatePoints(position) {
        if (position) {
            const pickedPoint = this.points[this.pickedIndex]
            if (!pickedPoint) return
            pickedPoint.attr(position).updateParentAndDiff()
        } else {
            this.clearPoints()
            this.addPoints()
        }
    }
    createController(points = []) {
        const factory = (x, y) => {
            return new Circle({
                ctx: this.graph.attrs.ctx,
                x,
                y,
                r: this.r,
                fillColor: DEFAULT_COLOR,
            })
        }
        return points.map(([x, y]) => factory(x, y))
    }
    get pointGenerators() {
        const rectPointGenerator = () => {
            const { x, y, width, height } = this.graph.attrs
            this.points = this.createController([
                [x, y],
                [x + width, y],
                [x + width, y + height],
                [x, y + height],
            ])
        }
        const polyPointGenerator = () => {
            const points = this.graph.attrs.points
            this.points = this.createController(
                points.map((point) => [point.attrs.x, point.attrs.y])
            )
        }
        return {
            rect: rectPointGenerator,
            picture: rectPointGenerator,
            polygon: polyPointGenerator,
        }
    }
}

function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

class Menu {
    constructor(position, editor, transformer) {
        this.position = position
        this.editor = editor
        this.transformer = transformer
        this.menu = document.createElement('div')
        this.menu.id = 'canvas-editor-menu'

        this.handleClick = this.handleClick.bind(this)

        this.setStyle()
        this.setContent()
        this.addListener()
    }
    setStyle() {
        Object.assign(this.menu.style, {
            position: 'fixed',
            left: this.position.x + 'px',
            top: this.position.y + 'px',
            userSelect: 'none',
        })
    }
    setContent() {
        this.menu.innerHTML = `
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
    }
    addListener() {
        this.menu.addEventListener('click', this.handleClick)
    }
    handleClick(evt) {
        if (evt.target.id === 'deleteGraphButton') {
            this.editor.emit('delete', this.transformer.graph)
            this.remove()
        }
    }
    append() {
        document.body.appendChild(this.menu)
    }
    remove() {
        this.menu?.removeEventListener('click', this.handleClick)
        this.menu?.remove()
        this.editor.menu = this.menu = null
    }
}
