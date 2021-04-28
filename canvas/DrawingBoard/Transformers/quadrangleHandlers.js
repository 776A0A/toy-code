import * as events from '../events.js'

export function quadrangleStart() {
    if (this.controller.pickedIndex === -1) return

    const { pickedIndex, points } = this.controller

    let targetPointIndex = 0

    if (pickedIndex % 2 === 0) {
        targetPointIndex = (pickedIndex + 4) % points.length
    } else {
        if (pickedIndex === 1) {
            targetPointIndex = 6
        } else if (pickedIndex === 3) {
            targetPointIndex = 0
        } else if (pickedIndex === 5) {
            targetPointIndex = 0
        } else if (pickedIndex === 7) {
            targetPointIndex = 2
        }
    }

    const [x, y] = points[targetPointIndex].getTranslate()
    this.graph.attr({ x, y }).updateChildrenDiff()
}

export function quadrangleDrag({ x, y }) {
    const diff = this.getDiff({ x, y })

    const graph = this.graph

    graph.attr({
        x: graph.attrs.x + diff.x,
        y: graph.attrs.y + diff.y,
    })
    this.controller.updatePoints()

    this.dragPosition = { x, y }
}

export function quadrangleResize({ x, y }) {
    const pickedIndex = this.controller.pickedIndex

    let attrs = {}

    if (pickedIndex % 2 === 0) {
        attrs = {
            width: x - this.graph.attrs.x,
            height: y - this.graph.attrs.y,
        }
    } else {
        if (pickedIndex === 1 || pickedIndex === 5) {
            attrs = { height: y - this.graph.attrs.y }
        } else {
            attrs = { width: x - this.graph.attrs.x }
        }
    }

    this.graph.attr(attrs)

    this.controller.updatePoints()
    this.graph.emit(events.SIZE_CHANGED)
}
