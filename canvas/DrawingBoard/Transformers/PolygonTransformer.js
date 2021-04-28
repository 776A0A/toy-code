import { Transformer } from './Transformer.js'
import * as events from '../events.js'

export class PolygonTransformer extends Transformer {
    name = 'polygonTransformer'
    graphName = 'polygon'
    start() {}
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
    resize({ x, y }) {
        // TODO 只要更新了自身的坐标，就要运行updatePointsDiff和updateChildrenDiff
        if (this.controller.pickedIndex === 0) {
            this.graph.attr({ x, y }).updatePointsDiff().updateChildrenDiff()
        } else {
            this.graph.attrs.points[this.controller.pickedIndex]
                ?.attr({ x, y })
                .updateParentAndDiff()
        }
        this.controller.updatePoints({ x, y })
        this.graph.emit(events.SIZE_CHANGED)
    }
}
