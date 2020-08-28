const map = document.getElementById('map')
const save = document.getElementById('save')
const reset = document.getElementById('reset')
let down, clear
let cells = localStorage.map
	? JSON.parse(localStorage.map)
	: Array(10000).fill(0)

const START_POINT = 'darkviolet'
const END_POINT = 'red'
const POINT = 'lightseagreen'
const PATH_COLOR = 'lightcoral'

async function findPath(map, start, end) {
	const queue = [start]

	draw(start[1] * 100 + start[0], START_POINT)
	draw(end[1] * 100 + end[0], END_POINT)

	let d = distance(start, end)
	while (queue.length) {
		let [x, y] = queue.shift()
		if (distance([x, y], end) - d <= 0) {
			d = distance([x, y], end)
			await sleep(1)
			draw(y * 100 + x, POINT)
			if (x === end[0] && y === end[1]) {
				draw(start[1] * 100 + start[0], START_POINT)
				while (!(x === start[0] && y === start[1])) {
					await sleep(1)
					draw(y * 100 + x, PATH_COLOR)
					;[x, y] = cells[y * 100 + x]
				}
				return true
			}
			// 上下左右
			await insert([x, y + 1], [x, y])
			await insert([x, y - 1], [x, y])
			await insert([x - 1, y], [x, y])
			await insert([x + 1, y], [x, y])

			// 斜方向
			if (!cells[(y + 1) * 100 + x] || !cells[y * 100 + x - 1]) {
				insert([x - 1, y + 1], [x, y])
			} else if (!cells[(y + 1) * 100 + x] || !cells[y * 100 + x + 1]) {
				insert([x + 1, y + 1], [x, y])
			} else if (!cells[y * 100 + x - 1] || !cells[(y - 1) * 100 + x]) {
				insert([x - 1, y - 1], [x, y])
			} else if (!cells[(y - 1) * 100 + x] || !cells[y * 100 + x + 1]) {
				insert([x + 1, y - 1], [x, y])
			}
		}
	}
	console.log('没有找到路线')
	return false

	async function insert([x, y], pre) {
		if (cells[y * 100 + x]) return
		if (x < 0 || x >= 100 || y < 0 || y >= 100) return
		cells[y * 100 + x] = pre
		queue.push([x, y])
	}
}

function distance(start, end) {
	return Math.abs(start[0] - end[0]) ** 2 + Math.abs(start[1] - end[1]) ** 2
}

function draw(i, color) {
	map.children[i].style.backgroundColor = color
}

function sleep(t) {
	return new Promise(resolve => setTimeout(resolve, t))
}

function render() {
	map.innerHTML = ''
	const frag = document.createDocumentFragment()
	cells.forEach((item, i) => {
		const cell = document.createElement('div')
		item && (cell.style.backgroundColor = 'black')
		cell.classList.add('cell')
		cell.addEventListener('mousemove', e => {
			if (down) {
				if (clear) {
					cells[i] = 0
					cell.style.backgroundColor = ''
				} else {
					cells[i] = 1
					cell.style.backgroundColor = 'black'
				}
			}
		})
		frag.append(cell)
	})
	map.append(frag)
}
save.addEventListener('click', e => (localStorage.map = JSON.stringify(cells)))
reset.addEventListener('click', e => {
	const answer = confirm('确认清空？')
	if (answer) {
		cells = Array(10000).fill(0)
		save.click()
		render()
	}
})

document.addEventListener('mousedown', e => {
	down = true
	if (e.which === 3) {
		clear = true
	}
})
document.addEventListener('mouseup', e => {
	down = false
	clear = false
})
document.addEventListener('contextmenu', e => e.preventDefault())
document.addEventListener('dragstart', e => e.preventDefault())

render()
