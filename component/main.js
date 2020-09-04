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

		setTimeout(nextPic, 1000)

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
