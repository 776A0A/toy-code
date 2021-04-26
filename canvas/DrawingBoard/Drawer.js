import { Point, Polygon, Rect } from './Graph.js'

// 绘制器，用于添加图形
class Drawer {
    graph = null
    // 更新显示
    update() {}
    // 提交图形，即完成绘制
    commit() {}
}

class RectDrawer extends Drawer {
    constructor(attrs) {
        super()
        this.graph = new Rect(attrs)
    }
    update({ x, y }) {
        const rect = this.graph
        if (!rect) return

        rect.attr({
            width: x - rect.x,
            height: y - rect.y,
        })
    }
}

class PolygonDrawer extends Drawer {
    constructor(attrs) {
        super()
        this.graph = new Polygon(attrs)
    }
    update(position) {
        const polygon = this.graph
        if (!polygon) return

        const polygonPoints = polygon.points
        let point

        if (polygonPoints[polygonPoints.length - 1].isPreviewPoint) {
            point = polygonPoints[polygonPoints.length - 1]
            point.attr(position)
        } else {
            point = new Point({
                ctx: polygon.ctx,
                x: position.x,
                y: position.y,
            })
            point.isPreviewPoint = true
            polygon.addPoint(point)
        }
    }
    addPoint(point) {
        this.graph.addPoint(point)
    }
    commit() {
        const polygon = this.graph
        if (!polygon) return

        polygon.points = polygon.points.filter((point) => !point.isPreviewPoint) // 删除所有预览点

        polygon.popPoint() // 因为dblclick也会触发mousedown事件，所有实际在mousedown时已经添加了两个点
    }
}

export const drawerGenerator = {
    rect: { generate: (attrs) => new RectDrawer(attrs) },
    polygon: { generate: (attrs) => new PolygonDrawer(attrs) },
}
