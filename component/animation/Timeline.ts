import { TimelineObject, NextTick } from './types'

enum TIMELINE_STATE {
	INITIAL,
	START,
	STOP
}

const DEFAULT_INTERVAL = 1000 / 60

export default class Timeline {
	interval: number = DEFAULT_INTERVAL
	state: TIMELINE_STATE = TIMELINE_STATE.INITIAL
	animationHandlerId: number = 0
	startTime?: number
	stopTime?: number

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
		this.stopTime = Date.now()
		cancelAnimationFrame(this.animationHandlerId)
	}

	restart() {
		if (this.state === TIMELINE_STATE.START) return

		this.state = TIMELINE_STATE.START

		startTimeline(this, Date.now())
	}
}

function startTimeline(timeline: TimelineObject, startTime: number) {
	let lastTick = Date.now() // 上一次回调的时间戳

	const nextTick: NextTick = () => {
		const now = Date.now()
		timeline.animationHandlerId = requestAnimationFrame(nextTick)
		// 如果当前时间与上一次的间隔大于指定的interval，表示可以执行回调函数
		if (now - lastTick >= timeline.interval) {
			timeline.onenterframe(now - startTime)
			lastTick = now
		}
	}

	if (timeline.stopTime) {
		timeline.startTime = Date.now() - timeline.stopTime + timeline.startTime
	} else timeline.startTime = startTime

	nextTick.interval = timeline.interval

	nextTick()
}
