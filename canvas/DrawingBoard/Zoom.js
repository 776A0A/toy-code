import { Plugin } from './Plugin.js'
import * as events from './events.js'

export class Zoom extends Plugin {
    stage = null
    center = { x: 0, y: 0 }
    offset = { x: 0, y: 0 }
    scaleTotal = 1
    originalGraphsInfo = []
    constructor({ maxScale = 3 } = {}) {
        super()
        this.maxScale = maxScale
    }
    install(stage) {
        this.stage = stage

        this.copyGraphs()

        stage
            .on('mousemove', ({ x, y }) => this.setCenter({ x, y }))
            .on('wheel', ({ nativeEvent }) => this.setScale(nativeEvent.deltaY))
    }
    setCenter(position) {
        this.center = position
    }
    setScale(deltaY) {
        let scale = this.scaleTotal
        scale += deltaY * -0.001
        scale = Math.max(Math.min(this.maxScale, scale), 1)

        if (scale !== this.scaleTotal) {
            this.scaleTotal = scale
            this.zoom()
        }
    }
    zoom() {
        const canvas = this.stage.canvas

        const { left, top, width, height } = canvas.getBoundingClientRect()

        const diff = {
            x: this.center.x - parseInt(left || 0),
            y: this.center.y - parseInt(top || 0),
        }

        const radio = {
            x: diff.x / parseInt(width),
            y: diff.y / parseInt(height),
        }

        const targetSize = {
            width: canvas.width * this.scaleTotal,
            height: canvas.height * this.scaleTotal,
        }

        let _left = -(radio.x * targetSize.width - diff.x)
        let _top = -(radio.y * targetSize.height - diff.y)

        if (this.scaleTotal === 1) {
            _left = _top = 0
            targetSize.width = 1000
            targetSize.height = 500
        }

        // Object.assign(canvas.style, {
        //     width: `${targetSize.width}px`,
        //     height: `${targetSize.height}px`,
        //     top: `${_top}px`,
        //     left: `${_left}px`,
        // })

        canvas.width = width / this.scaleTotal
        canvas.height = height / this.scaleTotal

        console.log(canvas.width, canvas.height)

        this.stage.emit(events.REFRESH_SCREEN)
    }
    copyGraphs() {
        const graphs = this.stage.graphManager.graphs
        this.originalGraphsInfo = graphs.map((graph) => {
            const { name, _attrs, widthParentDiff } = graph
            return {
                name,
                _attrs: { ..._attrs },
                widthParentDiff: { ...widthParentDiff },
            }
        })
    }
    updateGraphs() {
        this.copyGraphs()
    }
}
