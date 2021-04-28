import { Circle, DEFAULT_COLOR } from '../Graph.js'

export class ControlPoint {
    r = 5
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
                [x + width / 2, y],
                [x + width, y],
                [x + width, y + height / 2],
                [x + width, y + height],
                [x + width / 2, y + height],
                [x, y + height],
                [x, y + height / 2],
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
