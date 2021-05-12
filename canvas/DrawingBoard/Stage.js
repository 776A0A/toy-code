import { Display } from './Display.js'
import { EventEmitter } from './EventEmitter.js'
import { GraphManager } from './GraphManager.js'
import { events, cursors } from './shared.js'
import { Circle, Picture, Point, Polygon, Rect, Text } from './Graphs/index.js'
import { VpController } from './VpController.js'

// TODO 选择，框选
// TODO 显示窗口resize问题
// TODO 撤销和重做
// TODO 旋转

const LEFT_MOUSE_DOWN = 0

export const stageModes = {
  adder: Symbol('adder'),
  editor: Symbol('editor'),
  lock: Symbol('lock'),
}

export class Stage extends EventEmitter {
  mode = stageModes.adder
  plugins = new Set()
  vpControl = true
  vpController = new VpController()
  cursor = cursors.crosshair
  constructor(canvas) {
    super()

    this.canvas = canvas
    this._display = new Display(canvas)
    this.graphManager = new GraphManager(this)

    if (!this.vpControl) {
      this.vpController = null
    } else {
      this.vpController.install(this)
    }

    this.init()
  }
  init() {
    this.addListener()
    this.setCursor(cursors.crosshair)
  }
  // TODO 处理retina问题
  initRetina() {
    const dpi = window.devicePixelRatio
    const canvas = this.canvas

    canvas.style.width = `${canvas.width}px`
    canvas.style.height = `${canvas.height}px`

    canvas.width = canvas.width * dpi
    canvas.height = canvas.height * dpi

    canvas.getContext('2d').scale(dpi, dpi)
  }
  setMode(mode) {
    switch (mode) {
      case stageModes.adder:
        this.emit(events.END_EDIT)
        this.setCursor(cursors.crosshair)
        break
      case stageModes.editor:
        this.setCursor(cursors.grab)
        break
      case stageModes.lock:
        this.emit(events.END_EDIT)
        this.setCursor(cursors.default)
        break
      default:
        throw Error(`不正确的 stageMode：${String(mode)}`)
    }

    this.mode = mode

    return this
  }
  use(plugin) {
    if (this.plugins.has(plugin)) return this

    this.plugins.add(plugin)
    plugin.install(this)

    return this
  }
  get handlers() {
    return {
      handleMouseDown: (evt) => {
        if (evt.button !== LEFT_MOUSE_DOWN) return

        const params = generateParams.call(
          this,
          evt,
          this.vpController.getTransformedPosition(evt.offsetX, evt.offsetY)
        )

        if (this.vpController.isSpaceDown)
          this.vpController.handleMouseDown(params)
        else this.emit('mousedown', params)
      },
      handleMouseMove: (evt) => {
        const params = generateParams.call(
          this,
          evt,
          this.vpController.getTransformedPosition(evt.offsetX, evt.offsetY)
        )

        this.emit('mousemove', params)
      },
      handleMouseUp: (evt) => {
        const params = generateParams.call(this, evt)
        this.emit('mouseup', params)
      },
      handleMouseLeave: (evt) => {
        const params = generateParams.call(this, evt)
        this.emit('mouseleave', params)
      },
      handleDblClick: (evt) => {
        const params = generateParams.call(this, evt)
        this.emit('dblclick', params)
      },
      handleContextMenu: (evt) => {
        const params = generateParams.call(
          this,
          evt,
          this.vpController.getTransformedPosition(evt.clientX, evt.clientY)
        )

        this.emit('contextmenu', params)
      },
      handleWheel: (evt) => {
        const params = generateParams.call(this, evt)
        this.emit('wheel', params)
      },
      handleKeyDown: (evt) => {
        const params = generateParams.call(this, evt)
        this.emit('keydown', params)
      },
      handleKeyUp: (evt) => {
        const params = generateParams.call(this, evt)
        this.emit('keyup', params)
      },
    }
  }
  addListener() {
    this.beforeEach(() => this.mode !== stageModes.lock)
      .on({
        elem: this.canvas,
        type: 'mousedown',
        handler: this.handlers.handleMouseDown,
      })
      .on({
        elem: this.canvas,
        type: 'mousemove',
        handler: this.handlers.handleMouseMove,
      })
      .on({
        elem: this.canvas,
        type: 'mouseup',
        handler: this.handlers.handleMouseUp,
      })
      .on({
        elem: this.canvas,
        type: 'mouseleave',
        handler: this.handlers.handleMouseLeave,
      })
      .on({
        elem: this.canvas,
        type: 'dblclick',
        handler: this.handlers.handleDblClick,
      })
      .on({
        elem: this.canvas,
        type: 'contextmenu',
        handler: this.handlers.handleContextMenu,
      })
      .on({
        elem: this.canvas,
        type: 'wheel',
        handler: this.handlers.handleWheel,
      })
      .on({
        elem: document,
        type: 'keydown',
        handler: this.handlers.handleKeyDown,
      })
      .on({
        elem: document,
        type: 'keyup',
        handler: this.handlers.handleKeyUp,
      })
      .on({
        type: events.ADD_GRAPH,
        handler: (graph, insertIndex) => this.addGraph(graph, insertIndex),
      })
      .on({
        type: events.DELETE_GRAPH,
        handler: (graph) => this.deleteGraph(graph),
      })
      .on({ type: events.REFRESH_SCREEN, handler: () => this.display() })
      .on({
        type: events.CHANGE_CURSOR,
        handler: (cursor) => this.setCursor(cursor),
      })
  }
  addGraph(graph, insertIndex) {
    this.graphManager.add(graph, insertIndex)
    return this
  }
  deleteGraph(graph) {
    if (!graph) return

    this.graphManager.delete(graph)

    return this
  }
  clear() {
    this.graphManager.graphs.forEach((graph) => this.deleteGraph(graph))
    this.refresh()
    return this
  }
  display() {
    if (this.vpControl) {
      this.vpController.scale(() => {
        this._display.refresh(this.graphManager.graphs)
      })
    } else {
      this._display.refresh(this.graphManager.graphs)
    }
    return this
  }
  refresh() {
    this.display()
    return this
  }
  // TODO 深拷贝graphs
  import(graphs) {
    this.emit(events.IMPORT)

    const constructorMap = {
      rect: Rect,
      polygon: Polygon,
      text: Text,
      circle: Circle,
      point: Point,
      picture: Picture,
    }
    const ctx = this.canvas.getContext('2d')

    let imageNumber = 0,
      loadedImageNumber = 0

    const generate = (graphs, parent) => {
      graphs.forEach(({ attrs, name, children }) => {
        const constructor = constructorMap[name]

        if (name === 'picture') {
          imageNumber++
          const image = new Image()
          image.src =
            attrs.image instanceof Image ? attrs.image.src : attrs.image
          image.crossOrigin = 'anonymous'
          attrs.image = image
          image.onload = () => loadedImageNumber++
        }

        const graph = new constructor({ ctx, ...attrs })

        if (children.length) generate(children, graph)

        if (name === 'polygon') {
          const points = attrs.points.map(
            (point) => new Point({ ctx, ...point.attrs })
          )
          graph.attr({ points }).updatePointsDiff()
        }

        if (parent) parent.appendChild(graph)
        else this.addGraph(graph)
      })
    }

    generate(graphs)

    const waitToDraw = () => {
      if (imageNumber === loadedImageNumber) this.display()
      else setTimeout(waitToDraw, 50)
    }

    setTimeout(waitToDraw, 50)
  }
  // TODO 导出数据中增加canvas的宽高
  export() {
    this.emit(events.EXPORT)
    const graphs = this.graphManager.graphs
    const shakenGraphs = shake(graphs)
    return shakenGraphs

    function shake(graphs) {
      return graphs.map((graph) => {
        const { ctx, ...attrs } = graph.attrs

        const { name, children } = graph

        if (name === 'picture') attrs.image = attrs.image.src
        if (name === 'polygon')
          attrs.points = attrs.points.map((point) => {
            const { ctx, ...attrs } = point.attrs
            const { name, children } = point

            return { name, children, attrs }
          })

        const obj = { attrs, name, children }

        if (children.length) obj.children = shake(obj.children)

        return obj
      })
    }
  }
  setCursor(cursor) {
    if (!cursors[cursor]) throw Error('请传入合法的 cursor 值！')

    if (cursor === cursors.crosshair) {
      if (this.mode === stageModes.editor) cursor = cursors.grab
    }

    this.canvas.style.cursor = cursor
  }
  lock() {
    this.setMode(stageModes.lock)
    return this
  }
}

function generateParams(evt, params) {
  return {
    type: evt.type,
    nativeEvent: evt,
    graphs: this.graphManager.graphs,
    ...params,
  }
}
