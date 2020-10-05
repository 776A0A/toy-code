export interface PluginStatic {
	name: string | number
	exec: Exec
}

export type Exec = (currentValue, newVal?) => number

export interface BetaCalc {
	currentValue: number
	setValue: (value: number) => void
	core: object
	plugins: object
	press: (buttonName: number | string, newVal?: any) => void
	register: (plugin: PluginStatic) => void
	lifecycle: Lifecycle
}

export interface Lifecycle {
	beforeChange: Array<Function>
	afterChange: Array<Function>
}
