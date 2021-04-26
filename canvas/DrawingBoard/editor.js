import * as events from './events.js'
import { Plugin } from './Plugin.js'
import { transformerGenerator } from './Transformer.js'

export class Editor extends Plugin {
    constructor() {
        super()
        this.stage = null
        this.topGraphIndex = undefined
        this.isEditing = false // 点选到了某一个图形即为true
        this.editMode = 'wait'
        this.isDragging = false
        this.isResizing = false
        this.graphs = []
        this.transformer = null
    }
    get switchTo() {
        return {
            wait: () => {
                this.editMode = 'wait'
            },
            resize: () => {
                this.editMode = 'resize'
                this.isResizing = true
            },
            drag: () => {
                this.editMode = 'drag'
                this.isDragging = true
            },
        }
    }
    get ctx() {
        return this.stage.canvas.getContext('2d')
    }
    edit(position, graphs) {
        this.graphs = graphs

        if (!this.isEditing || this.editMode === 'wait') return

        if (this.editMode === 'resize') this.handleResize(position)
        else if (this.editMode === 'drag') this.handleDrag(position)
        else throw Error(`没有这个编辑模式：${this.editMode}`)
    }
    pick(position, graphs) {
        this.graphs = graphs
        if (!graphs.length) return

        if (this.transformer && this.transformer?.isPicked(position) !== -1) {
            this.transformer.start()
            this.switchTo.resize()
        } else {
            const top = this.findTop(position, graphs)

            // 没有选中过，什么都不做
            if (top === undefined && this.topGraphIndex === undefined) return

            this.transformer?.end()

            if (top !== undefined) {
                const graph = graphs[top]
                this.transformer = transformerGenerator[graph.name].generate(
                    graph,
                    position
                )

                this.isEditing = true
                this.topGraphIndex = top
                this.switchTo.drag()
            } else {
                this.isEditing = false
                this.topGraphIndex = undefined
            }

            this.stage.emit(events.REFRESH_SCREEN)
        }
    }
    delete() {
        this.transformer?.end()
        this.topGraphIndex = undefined
        this.transformer = null
        this.stop()
    }
    stop() {
        this.switchTo.wait()
        this.isDragging = this.isResizing = false
    }
    end() {
        if (this.transformer) {
            this.transformer.end()
            this.stage.emit(events.REFRESH_SCREEN)
        }
        this.isEditing = this.isDragging = this.isResizing = false
        this.topGraphIndex = undefined
        this.graphs = []
        this.transformer = null
    }
    findTop({ x, y }, graphs = []) {
        let top
        const { ctx } = this

        ;[...graphs].forEach((graph, idx) => {
            ctx.save()
            graph.drawPath()
            ctx.restore()
            // TODO 因为文字的原因，还需要增加判断是否在stroke上，可以在editor中增加方法抹平判断
            if (ctx.isPointInPath(x, y)) top = idx
        })

        return top
    }
    handleResize(position) {
        if (!this.isResizing) return

        this.transformer.resize(position)

        this.stage.emit(events.REFRESH_SCREEN)
    }
    handleDrag(position) {
        if (!this.isDragging) return

        this.transformer.drag(position)

        this.stage.emit(events.REFRESH_SCREEN)
    }
    install(stage) {
        this.stage = stage

        stage
            .on(
                'mousedown',
                ({ x, y, graphs }) => check() && this.pick({ x, y }, graphs)
            )
            .on(
                'mousemove',
                ({ x, y, graphs }) => check() && this.edit({ x, y }, graphs)
            )
            .on('mouseup', () => check() && this.stop())
            .on('mouseleave', () => check() && this.stop())
            .on(events.END_EDIT, () => this.end())

        function check() {
            return stage.switcher.mode === 'editor'
        }
    }
}
