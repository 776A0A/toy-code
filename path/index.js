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
const PATH = 'lightcoral'

class Sorted {
	constructor(queue, start, end) {
		this.queue = queue
		this.start = start
		this.end = end
	}
	take() {
		let min = this.queue[0]
		let minIndex = 0
		for (let j = 1; j < this.queue.length; j++) {
			if (distance(this.queue[j], this.end) - distance(min, this.end) < 0) {
				min = this.queue[j]
				minIndex = j
			}
		}
		this.queue[minIndex] = this.queue[this.queue.length - 1]
		this.queue.pop()
		return min
	}
	insert(point) {
		this.queue.push(point)
	}
	get length() {
		return this.queue.length
	}
}

async function findPath(map, start, end) {
	const queue = new Sorted([start], start, end)

	draw(start[1] * 100 + start[0], START_POINT)
	draw(end[1] * 100 + end[0], END_POINT)
	let hasMove = 0
	while (queue.length) {
		const point = queue.take()
		let [x, y] = point
		hasMove++
		console.log(`移动到 x: ${x}, y: ${y}，已经移动 ${hasMove} 步`)
		await sleep(1)
		draw(y * 100 + x, POINT)
		if (x === end[0] && y === end[1]) {
			draw(start[1] * 100 + start[0], START_POINT)
			let moved = 0
			while (!(x === start[0] && y === start[1])) {
				await sleep(1)
				draw(y * 100 + x, PATH)
				;[x, y] = cells[y * 100 + x]
				moved++
			}
			console.log(`移动 ${moved} 步即可到达终点`)
			return true
		}
		// 左
		await insert([x - 1, y], point)
		// 右
		await insert([x + 1, y], point)
		// 下
		await insert([x, y + 1], point)
		// 上
		await insert([x, y - 1], point)
		// 左下
		if (canThrough((y + 1) * 100 + x) || canThrough(y * 100 + x - 1)) {
			insert([x - 1, y + 1], point)
		}
		// 右下
		if (canThrough((y + 1) * 100 + x) || canThrough(y * 100 + x + 1)) {
			insert([x + 1, y + 1], point)
		}
		// 左上
		if (canThrough(y * 100 + x - 1) || canThrough((y - 1) * 100 + x)) {
			insert([x - 1, y - 1], point)
		}
		// 右上
		if (canThrough((y - 1) * 100 + x) || canThrough(y * 100 + x + 1)) {
			insert([x + 1, y - 1], point)
		}
	}
	console.log('没有找到路线')
	return false

	async function insert([x, y], pre) {
		if (cells[y * 100 + x]) return
		if (x < 0 || x >= 100 || y < 0 || y >= 100) return
		cells[y * 100 + x] = pre
		queue.insert([x, y])
	}
}

function canThrough(point) {
	return cells[point] && cells[point] !== 1
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
	e.which === 3 && (clear = true)
})
document.addEventListener('mouseup', e => {
	down = false
	clear = false
})
document.addEventListener('contextmenu', e => e.preventDefault())
document.addEventListener('dragstart', e => e.preventDefault())

render()
