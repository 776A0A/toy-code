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
					onPanstart={e => onPanstart(e, i)}
					onPan={e => onPan(e)}
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

		updateState()

		let transformedValue = 0
		const onPanstart = (e, i) => {
			tl.pause()
			clearTimeout(nextPicTimer)
			updateState(i)
			transformedValue =
				getTransformedValue(currentItem.style.transform) - -500 * currentI
		}

		const onPan = e => {
			const {
				detail: { clientX, startX }
			} = e
			const diffX = clientX - startX

			setTransform(currentItem, -500 * currentI + transformedValue + diffX)
			setTransform(lastItem, -500 - 500 * lastI + transformedValue + diffX)
			setTransform(nextItem, 500 - 500 * nextI + transformedValue + diffX)
		}

		const nextPic = () => {
			nextI = (currentI + 1) % this.data.length
			currentItem = children[currentI]

			nextItem = children[nextI]

			const width = currentItem.getBoundingClientRect().width

			tl.add(
				new Animation({
					object: currentItem.style,
					property: 'transform',
					start: -100 * currentI,
					end: -100 - 100 * currentI,
					duration: 1000,
					timingFunction: timingFunction.EASE,
					template: v => `translateX(${(width / 100) * v}px)`
				})
			).add(
				new Animation({
					object: nextItem.style,
					property: 'transform',
					start: 100 - 100 * nextI,
					end: -100 * nextI,
					duration: 1000,
					timingFunction: timingFunction.EASE,
					template: v => `translateX(${(width / 100) * v}px)`
				})
			)
			tl.start()

			currentI = nextI
			nextPicTimer = setTimeout(nextPic, 2000)
		}

		nextPicTimer = setTimeout(nextPic, 2000)

		return <div id='container'>{children}</div>

		function setTransform(item, v) {
			return (item.style.transform = `translateX(${v}px)`)
		}

		function updateState(i = 0) {
			updateIndex(i)
			updateItem()
		}

		function updateIndex(i = 0) {
			const len = children.length
			currentI = i
			lastI = (currentI - 1 + len) % len
			nextI = (i + 1) % len
			return { currentI, lastI, nextI }
		}

		function updateItem() {
			currentItem = children[currentI]
			lastItem = children[lastI]
			nextItem = children[nextI]
			return { currentItem, lastItem, nextItem }
		}

		function getTransformedValue(transform) {
			return Number(/translateX\((-?\d*\.?\d+)px\)/.exec(transform)[1])
		}
	}
	mountTo(parent) {
		this.render().mountTo(parent)
	}
}
