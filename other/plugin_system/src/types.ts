export interface PluginStatic {
	name: string
	exec: Exec
}

export type Exec = (currentValue: number, newVal?: any) => number

export interface LifecycleFn {
	(currentValue: number, next: () => void): void
}
export interface LifecycleFn {
	isCalled?: boolean
}

export interface BetaCalc {
	currentValue: number
	taskQueue: LifecycleFn[]
	isCalculating: boolean
	setValue: (value: number) => void
	core: BetaCalcMethodObject
	plugins: BetaCalcMethodObject
	press: (buttonName: string, newVal?: any) => void
	register: (plugin: PluginStatic) => void
	lifecycle: Lifecycle
	run: () => void
}

export interface Lifecycle {
	beforeChange: LifecycleFn[]
	afterChange: LifecycleFn[]
}

// 使用索引签名，并且指定为只读，使得不可替换已有的属性，限制了该对象下的所有属性的值必须为函数
export interface BetaCalcMethodObject {
	[action: string]: Exec
}
