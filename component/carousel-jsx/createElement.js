export default function createElement(cls, attributes, ...children) {
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
		// 事件监听
		if (/^on([A-Z][a-z_$]*)$/.test(k))
			this.addEventListener(RegExp.$1.toLowerCase(), v)
		else this.root.setAttribute(k, v)
	}
	get style() {
		return this.root.style
	}
	get getBoundingClientRect() {
		return this.root.getBoundingClientRect.bind(this.root)
	}
	appendChild(child) {
		this.children.push(child)
	}
	addEventListener() {
		this.root.addEventListener(...arguments)
	}
	mountTo(parent) {
		parent.appendChild(this.root)
		this.children.forEach(child => {
			if (typeof child === 'string') child = new Text(child)
			child.mountTo(this.root)
		})
	}
}
