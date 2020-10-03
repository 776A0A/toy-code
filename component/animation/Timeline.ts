import { TimelineObject, NextTick } from './types'

enum TIMELINE_STATE {
	INITIAL,
	START,
	STOP
}

export default class Timeline {
	interval: number = 1000 / 16
	state: TIMELINE_STATE = TIMELINE_STATE.INITIAL
	animationHandlerId: number = 0
	startTime?: number
	duration?: number

	onenterframe(time: number) {}

	start(interval: number) {
		if (this.state === TIMELINE_STATE.START) return
		this.state = TIMELINE_STATE.START
		if (interval) this.interval = interval
		startTimeline(this, Date.now())
	}

	stop() {
		if (this.state !== TIMELINE_STATE.START) return
		this.state = TIMELINE_STATE.STOP
		if (this.startTime) {
			this.duration = Date.now() - this.startTime
		}
		cancelAnimationFrame(this.animationHandlerId)
	}

	restart() {
		if (
			this.state === TIMELINE_STATE.START ||
			!this.duration ||
			!this.interval
		) {
			return
		}

		this.state = TIMELINE_STATE.START

		startTimeline(this, Date.now() - this.duration)
	}
}

function startTimeline(timeline: TimelineObject, startTime: number) {
	let lastTick: number = Date.now() // 上一次回调的时间戳

	const nextTick: NextTick = () => {
		const now = Date.now()
		timeline.animationHandlerId = requestAnimationFrame(nextTick)
		// 如果当前时间与上一次的间隔大于指定的interval，表示可以执行回调函数
		if (now - lastTick >= timeline.interval) {
			timeline.onenterframe(now - startTime)
			lastTick = now
		}
	}

	timeline.startTime = startTime
	nextTick.interval = timeline.interval

	nextTick()
}
