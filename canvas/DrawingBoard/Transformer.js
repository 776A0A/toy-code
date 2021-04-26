import * as events from './events.js'

class Transformer {
    constructor(graph) {
        this.graph = graph
        this.dragPosition = { x: 0, y: 0 }
    }
    start() {}
    resize() {}
    drag() {}
    end() {
        this.controller.clearPoints()
    }
    isPicked(position) {
        const points = this.controller.points
        return (this.controller.pickedIndex = points.findIndex((circle) => {
            const [x, y] = circle.getTranslate()
            return getDistance({ x, y }, position) <= circle.r
        }))
    }
}

class RectTransformer extends Transformer {
    constructor(graph) {
        super(graph)
        this.controller = new ControlPoint(graph)
    }
    start() {
        if (this.controller.pickedIndex === -1) return

        const { pickedIndex, points } = this.controller

        const diagonalPoint = points[(pickedIndex + 2) % points.length]

        const [x, y] = diagonalPoint.getTranslate()

        this.graph.attr({ x, y }).updateChildrenDiff()
    }
    reset(position, pickedIndex) {}
    resize({ x, y }) {
        this.graph.attr({ width: x - this.graph.x, height: y - this.graph.y })
        this.controller.updatePoints()
        this.graph.emit(events.SIZE_CHANGED)
    }
    drag({ x, y }) {
        const diff = {
            x: x - this.dragPosition.x,
            y: y - this.dragPosition.y,
        }

        const graph = this.graph

        graph.attr({ x: graph.x + diff.x, y: graph.y + diff.y })
        this.controller.updatePoints()

        this.dragPosition = { x, y }
    }
}

class PolygonTransformer extends Transformer {
    constructor(graph) {
        super(graph)
    }
    resize(position, pickedIndex) {
        if (pickedIndex === 0) {
            this.graph.attr(position).updatePointsDiff().updateChildrenDiff()
        } else {
            this.graph.points[pickedIndex]?.attr(position).updateParentAndDiff()
        }
        this.controller.updatePoints(position)
        this.graph.emit(events.SIZE_CHANGED)
    }
    drag({ x, y }) {
        const diff = {
            x: x - this.dragPosition.x,
            y: y - this.dragPosition.y,
        }

        this.graph.points.forEach((point) =>
            point.attr({ x: point.x + diff.x, y: point.y + diff.y })
        )
        this.controller.updatePoints()

        this.dragPosition = { x, y }
    }
}

class ControlPoint {
    constructor(graph) {
        this.graph = graph
        this.points = []
        this.pickedIndex = -1
        this.r = 10
        this.addPoints()
    }
    addPoints() {
        if (this.graph.name === 'rect') {
            const { x, y, width, height } = this.graph
            this.points = this.createController([
                [x, y],
                [x + width, y],
                [x + width, y + height],
                [x, y + height],
            ])
        } else if (this.graph.name === 'polygon') {
            const points = this.graph.points
            this.points = this.createController(
                points.map((point) => [point.x, point.y])
            )
        }
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
    pointFactory(x, y) {
        return new Circle({
            ctx: this.graph.ctx,
            x,
            y,
            r: this.r,
            fillColor: DEFAULT_COLOR,
        })
    }
    createController(points = []) {
        return points.map(([x, y]) => this.pointFactory(x, y))
    }
}

function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

export const transformerGenerator = {
    rect: { generate: (rect) => new RectTransformer(rect) },
    polygon: { generate: (polygon) => new PolygonTransformer(polygon) },
}
