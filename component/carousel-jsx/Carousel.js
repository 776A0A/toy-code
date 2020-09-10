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
			const width = currentItem.getBoundingClientRect().width
			// 已偏移的量减去应该偏移的量
			offsetDiffValue =
				getOffsetValue(currentItem.style.transform) - -width * currentI
		}

		const onPan = e => {
			const {
				detail: { clientX, startX }
			} = e
			const diffX = clientX - startX + offsetDiffValue // 拖拽距离
			const width = currentItem.getBoundingClientRect().width

			// 只允许拖拽一张图的宽度
			if (Math.abs(diffX) >= width) return

			setTransform(currentItem, -width * currentI + diffX)
			setTransform(lastItem, -width - width * lastI + diffX)
			setTransform(nextItem, width - width * nextI + diffX)
		}

		const onPanend = e => {
			const {
				detail: { clientX, startX, isFlick }
			} = e
			const diffX = clientX - startX + offsetDiffValue
			const width = currentItem.getBoundingClientRect().width

			let offset = 0

			if (isFlick) {
				if (diffX > 0) offset = -1
				else if (diffX < 0) offset = 1
			} else {
				if (diffX > 250) offset = -1
				else if (diffX < -250) offset = 1
			}

			tl.reset()
			// start为当前的位置，就是pan中的位置，end为应该到达的位置
			tl.add(
				animationFactory({
					object: lastItem.style,
					start: -width - width * lastI + diffX,
					end: -width - width * lastI - offset * width
				})
			)
				.add(
					animationFactory({
						object: currentItem.style,
						start: -width * currentI + diffX,
						end: -width * currentI - offset * width
					})
				)
				.add(
					animationFactory({
						object: nextItem.style,
						start: width - width * nextI + diffX,
						end: width - width * nextI - offset * width
					})
				)

			tl.start()
			updateState(currentI + offset)
			nextPicTimer = setTimeout(nextPic, 1000)
		}

		const nextPic = () => {
			const width = currentItem.getBoundingClientRect().width

			tl.add(
				animationFactory({
					object: currentItem.style,
					start: -width * currentI,
					end: -width - width * currentI
				})
			).add(
				animationFactory({
					object: nextItem.style,
					start: width - width * nextI,
					end: -width * nextI
				})
			)

			tl.start()

			updateState(nextI)
			nextPicTimer = setTimeout(nextPic, 1000)
		}

		nextPicTimer = setTimeout(nextPic, 1000)

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

		function animationFactory(config) {
			return new Animation({
				property: 'transform',
				duration: 500,
				template: v => `translateX(${v}px)`,
				timingFunction: timingFunction.EASE,
				...config
			})
		}
	}
	mountTo(parent) {
		this.render().mountTo(parent)
	}
}
