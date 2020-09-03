function create(cls, attributes) {
	const c = new cls()
	for (const key in attributes) {
		if (attributes.hasOwnProperty(key)) {
			const attr = attributes[key]
			c[key] = attr
		}
	}
	return c
}

class Div {}

const c = (
	<Div id='a' class='b'>
		123
	</Div>
)

console.log(c);