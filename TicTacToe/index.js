const _ = id => document.getElementById(id)

const board = _('board')
const result = _('result')
const reset = _('reset')
const plainPattern = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]
]
let pattern = clone(plainPattern)
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
			cellElem.onclick = e => userMove(y, x)
			frag.appendChild(cellElem)
		})
	})
	board.appendChild(frag)
}

function userMove(y, x) {
	if (pattern[y][x] || done) return
	pattern[y][x] = shape
	render()
	if (checkWinner(pattern, shape, y, x)) {
		done = true
		result.textContent = `Winner Is: ${cellMap[shape]}`
		return
	}
	shape = 3 - shape
	// 轮到你下
	const res = willWin(pattern, shape)
	if (res) {
		console.log(
			`If you(${cellMap[shape]}) move to ${JSON.stringify(res)}, you will win!`
		)
	} else {
		/**
		 * 我没有一步棋就能赢的局面，此时判断对方是否有大于两个的一步赢局面
		 * 因为只有一个的话我还能阻止
		 */
		willLose()
	}
	computerMove()
}

function computerMove() {
	if (done) return
	const res = willWin(pattern, shape)
	if (res) {
		done = true
		pattern[res.y][res.x] = shape
		result.textContent = `Winner Is: ${cellMap[shape]}`
	} else {
		const res = willWin(pattern, 3 - shape)
		if (res) {
			pattern[res.y][res.x] = shape
		} else {
			randomMove(pattern, shape)
		}
	}
	shape = 3 - shape
	render()
}

function randomMove(pattern, shape) {
	const isDraw = new Set()
	while (true) {
		if (isDraw.size === 9) return
		const random = () => Math.floor(Math.random() * 3)
		const [y, x] = [random(), random()]
		isDraw.add([y, x].join())
		if (!pattern[y][x]) {
			pattern[y][x] = shape
			break
		}
	}
}

function willLose() {
	const times = new Set()
	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			if (pattern[y][x]) continue
			const _pattern = clone(pattern)
			_pattern[y][x] = shape
			const res = willWin(_pattern, 3 - shape)
			res && times.add(JSON.stringify(res))
		}
	}
	if (times.size > 1) {
		console.log(
			`Opponent will win in ${Array.from(times).reduce(
				(p, position) => (p += '\n' + JSON.stringify(position)),
				''
			)}`
		)
	}
}

function willWin(pattern, shape) {
	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			if (pattern[y][x]) continue
			const _pattern = clone(pattern)
			_pattern[y][x] = shape
			if (checkWinner(_pattern, shape, y, x)) return { y, x }
		}
	}
}

function checkWinner(pattern, shape, y, x) {
	return (
		horizontal(pattern, shape, y, x) ||
		portrait(pattern, shape, y, x) ||
		crosswise1(pattern, shape, y, x) ||
		crosswise2(pattern, shape, y, x)
	)
}

function horizontal(pattern, shape, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[y][i] !== shape) return false
	}
	return true
}
function portrait(pattern, shape, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][x] !== shape) return false
	}
	return true
}
function crosswise1(pattern, shape, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][i] !== shape) return false
	}
	return true
}
function crosswise2(pattern, shape, y, x) {
	for (let i = 0; i < 3; i++) {
		if (pattern[i][2 - i] !== shape) return false
	}
	return true
}

function clone(pattern) {
	return JSON.parse(JSON.stringify(pattern))
}

reset.addEventListener('click', e => {
	pattern = clone(plainPattern)
	shape = 1
	done = false
	render()
})

render()
