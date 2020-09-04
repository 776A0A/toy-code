function create(cls, attributes, ...children) {
	let c

	if (typeof cls === 'string') c = new Element(cls)
	else c = new cls()

	for (const key in attributes) {
		if (attributes.hasOwnProperty(key)) {
			c.setAttribute(key, attributes[key])
		}
	}
	const append = children => {
		children.forEach(child => {
			if (typeof child === 'string') child = new Text(child)
			else if (Array.isArray(child)) return append(child)
			c.appendChild(child)
		})
	}

	append(children)

	return c
}

class Text {
	constructor(text) {
		this.root = document.createTextNode(text)
	}
	mountTo(parent) {
		parent.appendChild(this.root)
	}
}

class Element {
	constructor(type) {
		this.children = []
		this.root = document.createElement(type)
	}
	setAttribute(k, v) {
		this.root.setAttribute(k, v)
	}
	appendChild(child) {
		this.children.push(child)
	}
	addEventListener() {
		this.root.addEventListener(...arguments)
	}
	mountTo(parent) {
		parent.appendChild(this.root)
		this.children.forEach(child => child.mountTo(this.root))
	}
}

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
		return (
			<div id='container'>
				{this.data.map(url => (
					<img src={url} draggable={false} />
				))}
			</div>
		)
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
