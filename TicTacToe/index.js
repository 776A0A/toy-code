const _ = id => document.getElementById(id)

const board = _('board')
const result = _('result')
const pattern = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]
]
let done = false,
	shape = 1,
	cellMap = ['', '⭕', '❌']

function render() {
	const frag = document.createDocumentFragment()
	board.innerHTML = ''
	pattern.forEach((line, y) => {
		line.forEach((cell, x) => {
			const cellElem = document.createElement('div')
			cellElem.classList.add('cell')
			cellElem.textContent = cellMap[cell]
			cellElem.onclick = e => move(y, x)
			frag.appendChild(cellElem)
		})
	})
	board.appendChild(frag)
}

function move(y, x) {
	if (pattern[y][x] || done) return
	pattern[y][x] = shape
	render()
	if (checkWinner(shape, y, x)) {
		done = true
		result.textContent = `Winner Is: ${cellMap[shape]}`
		return
	}
	shape = 3 - shape
}

function checkWinner(shape, y, x) {
	return (
		horizontal(shape, y, x) ||
		portrait(shape, y, x) ||
		crosswise1(shape, y, x) ||
		crosswise2(shape, y, x)
	)
}

function horizontal(shape, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[y][i] !== shape) return false
	}
	return true
}
function portrait(shape, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][x] !== shape) return false
	}
	return true
}
function crosswise1(shape, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][i] !== shape) return false
	}
	return true
}
function crosswise2(shape, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][2 - i] !== shape) return false
	}
	return true
}

render()
