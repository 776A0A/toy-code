const _ = id => document.getElementById(id)

const board = _('board')
const result = _('result')
const pattern = [
	[1, 1, 0],
	[2, 0, 0],
	[0, 0, 0]
]
let done = false,
	shape = 2,
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
	if (checkWinner(pattern, y, x)) {
		done = true
		result.textContent = `Winner Is: ${cellMap[shape]}`
		return
	}
	shape = 3 - shape
	const res = willWin()
	if (res) {
		console.log(
			`If you(${cellMap[shape]}) move to ${JSON.stringify(res)}, you will win!`
		)
	}
}

function willWin() {
	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			if (pattern[y][x]) continue
			const _pattern = clone(pattern)
			_pattern[y][x] = shape
			if (checkWinner(_pattern, y, x)) return { y, x }
		}
	}
}

function checkWinner(pattern, y, x) {
	return (
		horizontal(pattern, y, x) ||
		portrait(pattern, y, x) ||
		crosswise1(pattern, y, x) ||
		crosswise2(pattern, y, x)
	)
}

function horizontal(pattern, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[y][i] !== shape) return false
	}
	return true
}
function portrait(pattern, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][x] !== shape) return false
	}
	return true
}
function crosswise1(pattern, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][i] !== shape) return false
	}
	return true
}
function crosswise2(pattern, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][2 - i] !== shape) return false
	}
	return true
}

function clone(pattern) {
	return JSON.parse(JSON.stringify(pattern))
}

render()
