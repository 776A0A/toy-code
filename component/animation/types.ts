import { IMAGE_STATE, TASK_TYPE } from './enums'

export interface ImageObject {
	src: string
	id: string
	img: HTMLImageElement
	state: IMAGE_STATE
}

export interface TaskObject {
	taskFn: TaskFn
	type: TASK_TYPE
	wait?: number
}

export type TaskFn = (next: () => void, time?: number) => void

export interface TimelineObject {
	onenterframe: (time: number) => void
	startTime?: number
	interval?: number
	animationHandlerId?: number
	start: (time: number) => void
	stop: () => void
	restart: () => void
}

export interface NextTick {
	(): void
}

export interface NextTick {
	interval: number
}
