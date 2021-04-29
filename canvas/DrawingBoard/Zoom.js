import { Plugin } from './Plugin.js'
import * as events from './events.js'

export class Zoom extends Plugin {
    stage = null
    center = { x: 0, y: 0 }
    target = { x: 0, y: 0 }
    scaleTotal = 1
    constructor({ maxScale = 2 } = {}) {
        super()
        this.maxScale = maxScale
    }
    install(stage) {
        this.stage = stage

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
            this.target.x = -(this.center.x * this.scaleTotal - this.center.x)
            this.target.y = -(this.center.y * this.scaleTotal - this.center.y)
            this.stage.emit(events.REFRESH_SCREEN)
        }
    }
}
