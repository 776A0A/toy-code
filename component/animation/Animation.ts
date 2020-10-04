import preloadImage from './preloadImage'
import { TaskObject, TaskFn, TimelineObject } from './types'
import { TASK_TYPE } from './enums'
import Timeline from './Timeline'

export enum ANIMATION_STATE {
	INITIAL,
	START,
	STOP
}
/**
 * taskQueue是一个任务队列，收集了同步和异步的任务，异步的任务只有在
 * 异步代码执行完毕或者动画目标完成的时候才会执行next，才会跳到下一个任务
 * 所以当动画目标没有完成时，同一个任务函数会被重复执行，该任务函数会被赋值给timeline 的 onenterframe
 * 而该 onterframe 就是该时间帧应该执行的函数
 */
class _Animation {
	private taskQueue: Array<TaskObject> = []
	private index: number = 0 // 当前正在执行的task的索引
	private timeline: TimelineObject = new Timeline()
	state: ANIMATION_STATE = ANIMATION_STATE.INITIAL
	interval: number

	loadImage(imgList: Array<string | object>) {
		const taskFn: TaskFn = next => {
			preloadImage(imgList.slice(), next)
		}

		let type = TASK_TYPE.SYNC

		return this._add(taskFn, type)
	}

	start(interval): _Animation {
		if (this.state === ANIMATION_STATE.START || !this.taskQueue.length)
			return this
		this.state = ANIMATION_STATE.START
		this.interval = interval
		this._runTask()
		return this
	}

	changePosition(
		ele: HTMLElement,
		positions: Array<string>,
		imageURL?: string
	) {
		function next(callback: () => void) {
			callback && callback()
		}

		const length = positions.length
		let taskFn: TaskFn, type: TASK_TYPE

		if (length) {
			taskFn = (next, time) => {
				if (imageURL) ele.style.backgroundImage = `url(${imageURL})`
				const index = Math.min((time / this.interval) | 0, length - 1) // 取到当前时间应当成为的index
				const [x, y] = positions[index].split(' ')
				ele.style.backgroundPosition = `${x}px ${y}px`
				if (index === length - 1) next()
			}
			type = TASK_TYPE.ASYNC
		} else {
			taskFn = next
			type = TASK_TYPE.SYNC
		}

		return this._add(taskFn, type)
	}

	changeSrc(ele: HTMLImageElement, imgList: Array<string>) {
		function next(callback: () => void) {
			callback && callback()
		}

		const length = imgList.length
		let taskFn: TaskFn, type: TASK_TYPE

		if (length) {
			taskFn = (next, time) => {
				const index = Math.min((time / this.interval) | 0, length - 1)
				ele.src = imgList[index]
				if (index === length - 1) next()
			}
			type = TASK_TYPE.ASYNC
		} else {
			taskFn = next
			type = TASK_TYPE.SYNC
		}

		return this._add(taskFn, type)
	}

	enterFrame(taskFn: TaskFn) {
		return this._add(taskFn, TASK_TYPE.ASYNC)
	}

	then(callback: () => void) {
		const taskFn: TaskFn = next => {
			callback()
			next()
		}
		const type = TASK_TYPE.SYNC

		return this._add(taskFn, type)
	}
	// 重复前一个任务
	repeat(times?: number) {
		// 做一层包装
		const taskFn: TaskFn = () => {
			// 无限循环同一个任务
			if (!times) {
				this.index--
				this._runTask()
				return
			}

			if (times) {
				times--
				this.index--
				this._runTask()
			} else {
				this._next(this.taskQueue[this.index])
			}
		}

		const type = TASK_TYPE.SYNC

		return this._add(taskFn, type)
	}

	repeatInfinity() {
		return this.repeat()
	}

	wait(time: number) {
		if (this.taskQueue.length > 0) {
			this.taskQueue[this.taskQueue.length - 1].wait = time
		}
		return this
	}

	pause() {
		if (this.state === ANIMATION_STATE.START) {
			this.state = ANIMATION_STATE.STOP
			this.timeline.stop()
		}
		return this
	}

	restart() {
		if (this.state === ANIMATION_STATE.STOP) {
			this.state = ANIMATION_STATE.START
			this.timeline.restart()
		}
		return this
	}

	dispose() {
		if (this.state !== ANIMATION_STATE.INITIAL) {
			this.state = ANIMATION_STATE.INITIAL
			this.taskQueue = []
			this.timeline.stop()
			this.timeline = new Timeline()
			this.index = 0
			this.interval = undefined
		}
		return this
	}

	private _add(taskFn: TaskFn, type: TASK_TYPE): _Animation {
		this.taskQueue.push({ taskFn, type })
		return this
	}
	private _runTask() {
		if (this.state !== ANIMATION_STATE.START || !this.taskQueue.length)
			return this
		if (this.index === this.taskQueue.length) {
			this.dispose()
			return this
		}

		const task = this.taskQueue[this.index]
		if (task.type === TASK_TYPE.SYNC) {
			this._syncTask(task)
		} else {
			this._asyncTask(task)
		}
	}
	private _syncTask(task: TaskObject) {
		const next = () => this._next(task)
		task.taskFn(next)
	}
	private _asyncTask(task: TaskObject) {
		// 定义每一帧执行的回调函数
		const enterFrame = (time: number) => {
			const next = () => {
				this.timeline.stop()
				this._next(task)
			}
			task.taskFn(next, time)
		}

		this.timeline.onenterframe = enterFrame
		this.timeline.start(this.interval)
	}
	private _next(task: TaskObject) {
		this.index++
		if (task && task.wait) {
			setTimeout(() => {
				this._runTask()
			}, task.wait)
		} else this._runTask()
	}
}

export default function animationFactory() {
	return new _Animation()
}
