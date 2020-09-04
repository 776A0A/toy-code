function create(cls, attributes, ...children) {
	const c = new cls()
	for (const key in attributes) {
		if (attributes.hasOwnProperty(key)) {
			c.setAttribute(key, attributes[key])
		}
	}
	for (const child of children) {
		c.appendChild(child)
	}
	return c
}

class Component {
	constructor(config) {
		this.children = []
		this.root = document.createElement('div')
	}
	setAttribute(k, v) {
		this.root.setAttribute(k, v)
	}
	appendChild(child) {
		this.children.push(child)
	}
	mountTo(parent) {
		parent.appendChild(this.root)
		this.children.forEach(child => child.mountTo(this.root))
	}
}

const c = (
	<Component
		id='a'
		class='b'
		style='width:100px;height:100px;background-color:lightblue;'
	>
		<Component></Component>
		<Component></Component>
		<Component></Component>
	</Component>
)

c.mountTo(document.body)
