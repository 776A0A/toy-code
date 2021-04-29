import { Point, Polygon, Rect } from './Graphs/index.js'
import { Plugin } from './Plugin.js'

// 绘制器，用于添加图形
class Drawer extends Plugin {
    graph = null
    graphName = 'drawer'
    adder = null
    install(adder) {
        this.adder = adder
        adder.injectDrawer(this.graphName, this)
    }
    generate(attrs) {}
    // 更新显示
    update() {}
    // 提交图形，即完成绘制
    commit() {}
}

export class RectDrawer extends Drawer {
    graphName = 'rect'
    generate(attrs) {
        this.graph = new Rect(attrs)
        return this
    }
    update({ x, y }) {
        const rect = this.graph
        if (!rect) return

        rect.attr({
            width: x - rect.attrs.x,
            height: y - rect.attrs.y,
        })
    }
}

export class PolygonDrawer extends Drawer {
    graphName = 'polygon'
    generate(attrs) {
        this.graph = new Polygon(attrs)
        return this
    }
    update(position) {
        const polygon = this.graph
        if (!polygon) return

        const polygonPoints = polygon.attrs.points
        let point

        if (polygonPoints[polygonPoints.length - 1].isPreviewPoint) {
            point = polygonPoints[polygonPoints.length - 1]
            point.attr(position)
        } else {
            point = new Point({
                ctx: polygon.attrs.ctx,
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

        const points = polygon.attrs.points.filter(
            (point) => !point.isPreviewPoint
        ) // 删除所有预览点

        points.pop() // 因为dblclick也会触发mousedown事件，所有实际在mousedown时已经添加了两个点

        polygon.attr({ points }) // 替换整个points
    }
}
