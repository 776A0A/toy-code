import createElement from './createElement'
import { Timeline, Animation, timingFunction } from './animation'
import enableGesture from './gesture'

class Carousel {
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
		const children = this.data.map(url => <img src={url} draggable={false} />)

		let position = 0,
			lastPosition,
			nextPosition
		let current, last, next

		const nextPic = () => {
			const tl = new Timeline()
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
			setTimeout(nextPic, 1000)
		}

		setTimeout(nextPic, 1000)

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

const carousel = (
	<Carousel
		data={[
			'https://tse1-mm.cn.bing.net/th/id/OIP.z2Q5yDKbQakzgCcUrKBJkAHaJz?pid=Api&rs=1',
			'https://tse4-mm.cn.bing.net/th/id/OIP.ZFVnyvQrDwUFrKd4a55VFAHaJ4?pid=Api&rs=1',
			'https://tse4-mm.cn.bing.net/th/id/OIP.2Fxq5vDKSaEYuTXzKuw_gwHaJ4?pid=Api&rs=1',
			'https://tse1-mm.cn.bing.net/th/id/OIP.diD6kXAYPVQN1I3YviPYJgHaFj?pid=Api&rs=1',
			'https://ranking.xgoo.jp/tool/images/column/2020/01/0128_9.jpg'
		]}
	/>
)

carousel.mountTo(document.body)
