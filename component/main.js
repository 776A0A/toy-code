import createElement from './createElement'

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

		let position = 0
		const nextPic = () => {
			const nextPosition = (position + 1) % this.data.length
			const current = children[position]
			const next = children[nextPosition]

			current.style.transition = `none`
			next.style.transition = `none`
			current.style.transform = `translateX(${-100 * position}%)`
			next.style.transform = `translateX(${100 - 100 * nextPosition}%)`

			setTimeout(() => {
				current.style.transition = `ease .5s`
				next.style.transition = `ease .5s`
				current.style.transform = `translateX(${-100 - 100 * position}%)`
				next.style.transform = `translateX(${-100 * nextPosition}%)`
				position = nextPosition
			}, 16)

			setTimeout(nextPic, 1000)
		}

		// setTimeout(nextPic, 1000)

		children.forEach(child => {
			child.addEventListener('mousedown', e => {
				const width = child.getBoundingClientRect.width
				const sX = e.clientX

				let lastPosition = (position - 1 + children.length) % children.length
				let nextPosition = (position + 1) % children.length

				let last = children[lastPosition]
				let current = children[position]
				let next = children[nextPosition]

				last.style.transition = `none`
				current.style.transition = `none`
				next.style.transition = `none`

				const move = e => {
					last.style.transform = `translateX(${
						-width - width * lastPosition - (sX - e.clientX)
					}px)`
					current.style.transform = `translateX(${
						-width * position - (sX - e.clientX)
					}px)`
					next.style.transform = `translateX(${
						width - width * nextPosition - (sX - e.clientX)
					}px)`
				}
				const up = e => {
					document.removeEventListener('mousemove', move)
					document.removeEventListener('mouseup', up)

					let offset = 0
					if (sX - e.clientX > 250) offset = -1
					else if (sX - e.clientX < -250) offset = 1

					last.style.transition = `ease .5s`
					current.style.transition = `ease .5s`
					next.style.transition = `ease .5s`

					position = (position - offset + children.length) % children.length
					lastPosition = (position - 1 + children.length) % children.length
					nextPosition = (position + 1) % children.length

					last = children[lastPosition]
					current = children[position]
					next = children[nextPosition]

					last.style.transform = `translateX(${
						-width - width * lastPosition
					}px)`
					current.style.transform = `translateX(${-width * position}px)`
					next.style.transform = `translateX(${width - width * nextPosition}px)`
				}

				document.addEventListener('mousemove', move)
				document.addEventListener('mouseup', up)
			})
		})

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
