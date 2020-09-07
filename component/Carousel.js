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

		const onStart = e => {
			tl.pause()
			clearTimeout(nextPicTimer)
		}

		const children = this.data.map(url => {
			const child = <img src={url} draggable={false} onStart={onStart} />
			enableGesture(child.root)
			return child
		})

		let position = 0,
			lastPosition,
			nextPosition
		let current, last, next

		const nextPic = () => {
			const nextPosition = (position + 1) % this.data.length
			const current = children[position]
			const next = children[nextPosition]

			tl.add(
				new Animation({
					object: current.style,
					property: 'transform',
					start: -100 * position,
					end: -100 - 100 * position,
					duration: 500,
					timingFunction: timingFunction.EASE,
					template: v => `translateX(${v}%)`
				})
			).add(
				new Animation({
					object: next.style,
					property: 'transform',
					start: 100 - 100 * nextPosition,
					end: -100 * nextPosition,
					duration: 500,
					timingFunction: timingFunction.EASE,
					template: v => `translateX(${v}%)`
				})
			)
			tl.start()

			position = nextPosition
			nextPicTimer = setTimeout(nextPic, 1000)
		}

		nextPicTimer = setTimeout(nextPic, 1000)

		// children.forEach(child => {
		// 	child = child.root

		// 	enableGesture(child)

		// 	child.addEventListener('panstart', e => {
		// 		lastPosition = (position - 1 + children.length) % children.length
		// 		nextPosition = (position + 1) % children.length

		// 		last = children[lastPosition]
		// 		current = children[position]
		// 		next = children[nextPosition]

		// 		last.style.transition = `none`
		// 		current.style.transition = `none`
		// 		next.style.transition = `none`
		// 	})
		// 	child.addEventListener('pan', e => {
		// 		const width = child.getBoundingClientRect().width
		// 		const {
		// 			detail: { startX, clientX }
		// 		} = e

		// 		last.style.transform = `translateX(${
		// 			-width - width * lastPosition - (startX - clientX)
		// 		}px)`
		// 		current.style.transform = `translateX(${
		// 			-width * position - (startX - clientX)
		// 		}px)`
		// 		next.style.transform = `translateX(${
		// 			width - width * nextPosition - (startX - clientX)
		// 		}px)`
		// 	})
		// 	child.addEventListener('panend', e => {
		// 		const width = child.getBoundingClientRect().width
		// 		const {
		// 			detail: { startX, clientX }
		// 		} = e

		// 		let offset = 0
		// 		if (startX - clientX > 250) offset = -1
		// 		else if (startX - clientX < -250) offset = 1

		// 		last.style.transition = `ease .5s`
		// 		current.style.transition = `ease .5s`
		// 		next.style.transition = `ease .5s`

		// 		position = (position - offset + children.length) % children.length
		// 		lastPosition = (position - 1 + children.length) % children.length
		// 		nextPosition = (position + 1) % children.length

		// 		last = children[lastPosition]
		// 		current = children[position]
		// 		next = children[nextPosition]

		// 		last.style.transform = `translateX(${-width - width * lastPosition}px)`
		// 		current.style.transform = `translateX(${-width * position}px)`
		// 		next.style.transform = `translateX(${width - width * nextPosition}px)`
		// 	})
		// })

		return <div id='container'>{children}</div>
	}
	mountTo(parent) {
		this.render().mountTo(parent)
	}
}
