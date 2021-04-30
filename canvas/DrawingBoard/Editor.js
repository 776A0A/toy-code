import { events, cursors } from './shared.js'
import { PolygonTransformer, RectTransformer, PictureTransformer } from './Transformers/index.js'
import { PluginHost } from './PluginHost.js'

export const editorModes = {
    wait: Symbol('wait'), // 等在选择图形
    resize: Symbol('resize'),
    drag: Symbol('drag'),
}

export class Editor extends PluginHost {
    stage = null
    topGraphIndex = undefined
    isEditing = false // 点选到了某一个图形即为true
    isDragging = false
    isResizing = false
    mode = editorModes.wait
    transformers = new Map()
    transformer = null
    plugins = new Set()
    constructor() {
        super()
        this.init()
    }
    init() {
        this.on({
            type: events.DELETE_GRAPH,
            handler: (graph) => {
                this.stage.emit(events.DELETE_GRAPH, graph).emit(events.REFRESH_SCREEN)
                this.deleteGraph()
            },
        })
    }
    injectTransformer(name, transformer) {
        if (this.transformers.has(name)) return
        this.transformers.set(name, transformer)
    }
    setMode(mode) {
        this.mode = mode

        if (mode === editorModes.resize) {
            this.isResizing = true
            this.transformer.start()
        } else if (mode === editorModes.drag) {
            this.isDragging = true
        } else if (mode === editorModes.wait) {
            this.isResizing = this.isDragging = false
            this.stage.emit(events.CHANGE_CURSOR, cursors.grab)
        }
    }
    edit({ x, y }) {
        if (!this.isEditing || this.mode === editorModes.wait) return

        if (this.mode === editorModes.resize && this.isResizing) {
            this.transformer.resize({ x, y })
        } else if (this.mode === editorModes.drag && this.isDragging) {
            this.transformer.drag({ x, y })
        } else throw Error(`没有这个编辑模式：${this.mode}`)

        this.stage.emit(events.REFRESH_SCREEN)
    }
    pick({ x, y }) {
        this.removeMenuIfHas()

        const graphs = this.stage.graphManager.graphs
        if (!graphs.length) return

        if (this.transformer && this.transformer.isPicked({ x, y }) !== -1) {
            this.setMode(editorModes.resize)
            this.stage.emit(events.CHANGE_CURSOR, cursors.grabbing)
        } else {
            const top = this.findTop({ x, y })

            // 没有选中过，什么都不做
            if (top === undefined && this.topGraphIndex === undefined) return

            this.transformer?.end()

            if (top !== undefined) {
                const graph = graphs[top]
                this.transformer = this.transformers.get(graph.name).generate(graph, { x, y })

                this.isEditing = true
                this.topGraphIndex = top
                this.setMode(editorModes.drag)
                this.stage.emit(events.CHANGE_CURSOR, cursors.grabbing)
            } else {
                this.isEditing = false
                this.topGraphIndex = undefined
                this.stage.emit(events.CHANGE_CURSOR, cursors.grab)
            }

            this.stage.emit(events.REFRESH_SCREEN)
        }
    }
    // 删除图形
    deleteGraph() {
        this.topGraphIndex = undefined
        this.transformer = null
        this.setMode(editorModes.wait)
    }
    // 结束编辑，已经进入非编辑状态
    end() {
        if (this.transformer) {
            this.transformer.end()
            this.stage.emit(events.REFRESH_SCREEN)
        }
        this.removeMenuIfHas()
        this.isEditing = this.isDragging = this.isResizing = false
        this.topGraphIndex = undefined
        this.transformer = null
    }
    findTop({ x, y }) {
        const graphs = this.stage.graphManager.graphs
        if (!graphs.length) return

        let top
        ;[...graphs].forEach((graph, idx) => {
            if (graph.isInPath(x, y)) top = idx
        })

        return top
    }
    removeMenuIfHas() {
        if (this.transformer?.menu) {
            this.transformer.menu.remove()
            this.transformer.menu = null
        }
    }
    handleContextmenu({ x, y, nativeEvent }) {
        nativeEvent.preventDefault()

        if (this.topGraphIndex === undefined) return

        this.transformer.handleContextmenu({ x, y, nativeEvent })
    }
    install(stage) {
        this.stage = stage

        stage
            .on({
                type: 'mousedown',
                handler: (event) => check() && this.pick(event),
            })
            .on({
                type: 'mousemove',
                handler: (event) => check() && this.edit(event),
            })
            .on({
                type: 'mouseup',
                handler: () => check() && this.setMode(editorModes.wait),
            })
            .on({
                type: 'mouseleave',
                handler: () => check() && this.setMode(editorModes.wait),
            })
            .on({
                type: 'contextmenu',
                handler: (event) => check() && this.handleContextmenu(event),
            })
            .on({ type: events.END_EDIT, handler: () => this.end() })

        function check() {
            return stage.mode === 'editor'
        }
    }
}

export const editor = new Editor()
const rectTransformer = new RectTransformer()
const polygonTransformer = new PolygonTransformer()
const pictureTransformer = new PictureTransformer()

editor.use(rectTransformer).use(polygonTransformer).use(pictureTransformer)
