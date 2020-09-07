const INITED = Symbol('inited')
const PLAYING = Symbol('playing')
const PAUSED = Symbol('paused')

class Timeline {
	constructor() {
		this.animations = []
		this.requestID = null
		this.state = INITED
	}
	tick() {
		const t = Date.now() - this.startTime
		const animations = this.animations.filter(
			animation => !animation.isFinished
		)
		for (const animation of animations) {
			const {
				object,
				property,
				start,
				end,
				template,
				duration,
				delay,
				timingFunction
			} = animation
			let progression = timingFunction((t - delay) / duration) // 得到当前进度 0 - 1 之间
			if (t > animation.duration + animation.delay) {
				progression = 1
				animation.isFinished = true
			}
			if (progression < 0) continue
			const value = start + progression * (end - start) // 通过进度算出值
			object[property] = template(value)
		}
		if (animations.length)
			this.requestID = requestAnimationFrame(() => this.tick())
	}
	add(a) {
		this.animations.push(a)
	}
	pause() {
		if (this.state !== PLAYING) return
		this.state = PAUSED
		this.pauseTime = Date.now()
		cancelAnimationFrame(this.requestID)
	}
	resume() {
		if (this.state !== PAUSED) return
		this.state = PLAYING
		this.startTime += Date.now() - this.pauseTime
		this.tick()
	}
	start() {
		if (this.state !== INITED) return
		this.state = PLAYING
		this.startTime = Date.now()
		this.tick()
	}
}

class Animation {
	constructor(config) {
		const {
			object,
			property,
			start,
			end,
			template,
			duration,
			delay,
			timingFunction
		} = config
		Object.assign(this, config)
		this.delay = delay || 0
		this.timingFunction = timingFunction || (() => {})
	}
}