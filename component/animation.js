import generateCubicBezier from './cubicBezier'

const INITED = Symbol('inited')
const PLAYING = Symbol('playing')
const PAUSED = Symbol('paused')

export class Timeline {
	constructor() {
		this.animations = new Set()
		this.addTimes = new Map()
		this.requestID = null
		this.state = INITED
	}
	tick() {
		const t = Date.now() - this.startTime, // 已经经过的时间
			animations = this.animations

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
			const addTime = this.addTimes.get(animation)
			let progression = timingFunction((t - delay - addTime) / duration) // 得到当前进度 0 - 1 之间
			if (t > animation.duration + animation.delay + addTime) {
				progression = 1
				this.animations.delete(animation)
			}
			if (progression < 0) continue
			object[property] = template(start + progression * (end - start)) // 通过进度算出值
		}
		if (animations.size)
			this.requestID = requestAnimationFrame(() => this.tick())
		else this.requestID = null
	}
	add(animation, addTime) {
		this.animations.add(animation)
		if (this.state === PLAYING && this.requestID === null) this.tick()
		if (this.state === PLAYING)
			this.addTimes.set(animation, addTime ?? Date.now() - this.startTime)
		else this.addTimes.set(animation, addTime ?? 0)
		return this
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

export class Animation {
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

export const timingFunction = {
	LINEAR: v => v,
	EASE: generateCubicBezier(0.25, 0.1, 0.25, 1),
	EASEIN: generateCubicBezier(0.42, 0, 1, 1),
	EASEOUT: generateCubicBezier(0, 0, 0.58, 1),
	EASEINOUT: generateCubicBezier(0.42, 0, 0.58, 1)
}
