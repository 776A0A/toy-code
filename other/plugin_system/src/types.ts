export interface PluginStatic {
	name: string | number
	exec: Exec
}

export type Exec = (currentValue: number, newVal?: any) => number

export interface BetaCalc {
	currentValue: number
	setValue: (value: number) => void
	core: BetaCalcMethodObject
	plugins: BetaCalcMethodObject
	press: (this: BetaCalc, buttonName: number | string, newVal?: any) => void
	register: (plugin: PluginStatic) => void
	lifecycle: Lifecycle
}

export interface Lifecycle {
	beforeChange: Array<Function>
	afterChange: Array<Function>
}

// 使用索引签名，并且指定为只读，使得不可替换已有的属性，限制了该对象下的所有属性的值必须为函数
export interface BetaCalcMethodObject {
	readonly [action: string]: Exec
}
