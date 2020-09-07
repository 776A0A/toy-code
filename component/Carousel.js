import createElement from './createElement'
import enableGesture from './gesture'
import { Timeline, Animation, timingFunction } from './animation'

export default class Carousel {
	constructor() {
		this.children = []
		this.root = document.createElement('div')
	}
	setAttribute(k, v) {
		this[k] = v
	}
	appendChild(child) {
		this.children.push(child)
	}
	render() {
		const tl = new Timeline()
		let nextPicTimer = null

		const children = this.data.map((url, i) => {
			const child = (
				<img
					src={url}
					draggable={false}
					onStart={e => onStart(e, i)}
					onPan={e => onPan(e)}
					onPanend={e => onPanend(e)}
				/>
			)
			setTransform(child, 0) // 设定初始值
			enableGesture(child.root)
			return child
		})

		let currentI = 0,
			lastI,
			nextI
		let currentItem, lastItem, nextItem

		updateState(0)

		let offsetDiffValue = 0 // 偏移的差值
		const onStart = (e, i) => {
			tl.pause()
			clearTimeout(nextPicTimer)

			updateState(i)

			// 已偏移的量减去应该偏移的量
			offsetDiffValue =
				getOffsetValue(currentItem.style.transform) - -500 * currentI
		}

		const onPan = e => {
			const {
				detail: { clientX, startX }
			} = e
			const diffX = clientX - startX // 拖拽后移动的距离

			if (Math.abs(diffX) >= 500) return

			setTransform(currentItem, -500 * currentI + offsetDiffValue + diffX)
			setTransform(lastItem, -500 - 500 * lastI + offsetDiffValue + diffX)
			setTransform(nextItem, 500 - 500 * nextI + offsetDiffValue + diffX)
		}

		const onPanend = e => {
			const {
				detail: { clientX, startX }
			} = e
			const diffX = clientX - startX

			if (diffX > 250) {
				updateState(currentI - 1)
			} else if (diffX < -250) {
				updateState(currentI + 1)
			}
			console.log({ currentI, lastI, nextI })
			// nextPic()
		}
		const nextPic = () => {
			const width = currentItem.getBoundingClientRect().width

			tl.add(
				new Animation({
					object: currentItem.style,
					property: 'transform',
					start: -width * currentI,
					end: -width - width * currentI,
					duration: 1000,
					timingFunction: timingFunction.LINEAR,
					template: v => `translateX(${v}px)`
				})
			).add(
				new Animation({
					object: nextItem.style,
					property: 'transform',
					start: width - width * nextI,
					end: -width * nextI,
					duration: 1000,
					timingFunction: timingFunction.LINEAR,
					template: v => `translateX(${v}px)`
				})
			)
			tl.start()

			updateState(nextI)
			nextPicTimer = setTimeout(nextPic, 2000)
		}

		nextPicTimer = setTimeout(nextPic, 2000)

		return <div id='container'>{children}</div>

		function setTransform(item, v) {
			return (item.style.transform = `translateX(${v}px)`)
		}

		function updateState(i = 0) {
			const len = children.length

			currentI = (i + len) % len
			lastI = (currentI - 1 + len) % len
			nextI = (i + 1) % len

			currentItem = children[currentI]
			lastItem = children[lastI]
			nextItem = children[nextI]
		}

		function getOffsetValue(transform) {
			return Number(/translateX\((-?\d*\.?\d+)px\)/.exec(transform)?.[1])
		}
	}
	mountTo(parent) {
		this.render().mountTo(parent)
	}
}
