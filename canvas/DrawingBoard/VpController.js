import { Plugin } from './Plugin.js'
import * as events from './events.js'

// viewport controller
export class VpController extends Plugin {
    stage = null
    vpCenter = { x: 0, y: 0 }
    pan = { x: 0, y: 0 }
    scaleFactor = 1 // 缩放因子
    isSpaceDown = false
    isMouseDown = false
    mouseDownPosition = { x: 0, y: 0 }
    constructor({ minScale = 1, maxScale = 2 } = {}) {
        super()
        this.minScale = minScale
        this.maxScale = maxScale
    }
    install(stage) {
        this.stage = stage

        stage
            .on({
                type: 'keydown',
                handler: (evt) => this.handleKeyDown(evt),
            })
            .on({ type: 'keyup', handler: () => (this.isSpaceDown = false) })
            .on({ type: 'mouseup', handler: () => (this.isMouseDown = false) })
            .on({
                type: 'mouseleave',
                handler: () => (this.isMouseDown = false),
            })
            .on({
                type: 'mousemove',
                handler: (evt) => this.handleMouseMove(evt),
            })
            .on({
                type: 'wheel',
                handler: ({ nativeEvent }) => {
                    this.setScaleFactor(nativeEvent.deltaY)
                },
            })
    }
    setVpCenter(position) {
        this.vpCenter = position
    }
    setScaleFactor(deltaY) {
        let scale = this.scaleFactor
        scale += deltaY * -0.001
        scale = Math.max(Math.min(this.maxScale, scale), this.minScale)

        if (scale !== this.scaleFactor) {
            this.scaleFactor = scale
            this.pan.x = -(this.vpCenter.x * this.scaleFactor - this.vpCenter.x)
            this.pan.y = -(this.vpCenter.y * this.scaleFactor - this.vpCenter.y)
            this.stage.emit(events.REFRESH_SCREEN)
        }
    }
    scale(displayCb) {
        const ctx = this.stage.canvas.getContext('2d')
        const { pan, scaleFactor } = this
        this.correctPan()
        ctx.save()
        ctx.translate(pan.x, pan.y)
        ctx.scale(scaleFactor, scaleFactor)
        displayCb()
        ctx.restore()
    }
    getTransformedPosition(x, y) {
        return {
            x: (x - this.pan.x) / this.scaleFactor,
            y: (y - this.pan.y) / this.scaleFactor,
        }
    }
    handleKeyDown({ nativeEvent }) {
        if (nativeEvent.code.toLowerCase() === 'space') {
            this.isSpaceDown = true
        }
    }
    handleMouseDown({ nativeEvent, x, y }) {
        if (this.isSpaceDown) {
            this.isMouseDown = true
            this.mouseDownPosition.x = x
            this.mouseDownPosition.y = y
            nativeEvent.stopPropagation()
        } else this.isMouseDown = false
    }
    handleMouseMove({ x, y }) {
        if (this.isSpaceDown && this.isMouseDown) {
            const diff = {
                x: x - this.mouseDownPosition.x,
                y: y - this.mouseDownPosition.y,
            }
            this.pan.x += diff.x
            this.pan.y += diff.y

            this.correctPan()

            this.mouseDownPosition.x = x
            this.mouseDownPosition.y = y
        }

        this.setVpCenter({ x, y })

        this.stage.emit(events.REFRESH_SCREEN)
    }
    correctPan() {
        // 缩放因子为1，则不能位移
        if (this.scaleFactor === 1) this.pan = { x: 0, y: 0 }
        else {
            // 不能向右拉过头
            if (this.pan.x > 0 || this.pan.y > 0) {
                if (this.pan.x > 0) this.pan.x = 0
                if (this.pan.y > 0) this.pan.y = 0
            } else {
                const { width, height } = this.stage.canvas

                const diff = {
                    x: -(width * this.scaleFactor - width),
                    y: -(height * this.scaleFactor - height),
                }
                // 不能向左拉过头
                if (this.pan.x < diff.x) this.pan.x = diff.x
                if (this.pan.y < diff.y) this.pan.y = diff.y
            }
        }
    }
}
