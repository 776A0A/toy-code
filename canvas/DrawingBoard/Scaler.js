import { Plugin } from './Plugin.js'
import * as events from './events.js'

export class Scaler extends Plugin {
    stage = null
    center = { x: 0, y: 0 }
    pan = { x: 0, y: 0 }
    scaleFactor = 1 // 缩放因子
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
        let scale = this.scaleFactor
        scale += deltaY * -0.001
        scale = Math.max(Math.min(this.maxScale, scale), 1)

        if (scale !== this.scaleFactor) {
            this.scaleFactor = scale
            this.pan.x = -(this.center.x * this.scaleFactor - this.center.x)
            this.pan.y = -(this.center.y * this.scaleFactor - this.center.y)
            this.stage.emit(events.REFRESH_SCREEN)
        }
    }
    getTranslatedPosition(x, y) {
        return {
            x: (x - this.pan.x) / this.scaleFactor,
            y: (y - this.pan.y) / this.scaleFactor,
        }
    }
}
