/**
 * 参考自
 * https://css-tricks.com/designing-a-javascript-plugin-system/
 */

import { PluginStatic, Exec, BetaCalc } from './types'

const betaCalc: BetaCalc = {
	currentValue: 0,
	taskQueue: [],
	isCalculating: false,
	setValue(value) {
		this.currentValue = value
		console.log(this.currentValue)
	},
	core: {
		plus: (currentValue, newVal) => currentValue + newVal,
		minus: (currentValue, newVal) => currentValue - newVal
	},
	plugins: {},
	press(this: BetaCalc, buttonName, newVal?) {
		if (this.isCalculating) return
		this.isCalculating = true
		const exec: Exec = this.core[buttonName] || this.plugins[buttonName]
		const { beforeChange, afterChange } = this.lifecycle
		if (beforeChange.length) {
			this.taskQueue.push(...beforeChange)
		}
		this.taskQueue.push((currentValue, next) => {
			this.setValue(exec(currentValue, newVal))
			next()
		})
		if (afterChange.length) {
			this.taskQueue.push(...afterChange)
		}

		this.run()
	},
	register(plugin) {
		const { name, exec } = plugin
		this.plugins[name] = exec
	},
	lifecycle: {
		beforeChange: [
			(currentValue, next) => {
				console.log(currentValue)
				next()
			}
		],
		afterChange: []
	},
	run(this: BetaCalc) {
		const taskQueue = this.taskQueue

		if (!taskQueue.length) return

		let index = 0

		const step = (i: number): void => {
			if (i === taskQueue.length) {
				this.isCalculating = false
				this.taskQueue = []
				return
			}
			const task = taskQueue[index++]

			if (task.isCalled) return next()

			task(this.currentValue, () => {
				task.isCalled = true
				next()
			})
		}

		const next = () => step(index)

		step(index)
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
