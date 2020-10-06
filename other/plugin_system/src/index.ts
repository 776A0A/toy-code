/**
 * 参考自
 * https://css-tricks.com/designing-a-javascript-plugin-system/
 */

import { PluginStatic, Exec, BetaCalc } from './types'

const betaCalc: BetaCalc = {
	currentValue: 0,
	setValue(value) {
		this.currentValue = value
		console.log(this.currentValue)
	},
	core: {
		plus: (currentValue, newVal) => currentValue + newVal,
		minus: (currentValue, newVal) => currentValue - newVal,
	},
	plugins: {},
	press(this: BetaCalc, buttonName, newVal?) {
		const exec: Exec = this.core[buttonName] || this.plugins[buttonName]
		const { beforeChange, afterChange } = this.lifecycle
		this.setValue(exec(this.currentValue, newVal))
	},
	register(plugin) {
		const { name, exec } = plugin
		this.plugins[name] = exec
	},
	lifecycle: {
		beforeChange: [],
		afterChange: []
	}
}

const squaredPlugin: PluginStatic = {
	name: 'squared',
	exec: currentValue => currentValue ** 2
}

betaCalc.register(squaredPlugin)

betaCalc.setValue(3)
betaCalc.press('plus', 2)
betaCalc.press('squared')
