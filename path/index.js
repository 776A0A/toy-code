const map = document.getElementById('map')
const save = document.getElementById('save')
const reset = document.getElementById('reset')
const tip = document.getElementById('tip')
let down, clear
let cells = localStorage.map
	? JSON.parse(localStorage.map)
	: Array(10000).fill(0)

const START_POINT = 'red'
const END_POINT = 'white'
const POINT = 'lightseagreen'
const PATH = 'aqua'

class Sorted {
	constructor(data, compare) {
		this.data = data
		this.compare = compare
	}
	take() {
		let min = this.data[0]
		let minIndex = 0
		for (let i = 1; i < this.data.length; i++) {
			if (this.compare(this.data[i], min)) {
				min = this.data[i]
				minIndex = i
			}
		}
		this.data[minIndex] = this.data[this.data.length - 1]
		this.data.pop()
		return min
	}
	insert(point) {
		this.data.push(point)
	}
	get length() {
		return this.data.length
	}
}

async function findPath(start, end) {
	const collection = new Sorted(
		[start],
		(a, b) => distance(a, end) - distance(b, end) < 0
	)
	let hasMove = 0

	draw(start[1] * 100 + start[0], START_POINT)
	draw(end[1] * 100 + end[0], END_POINT)

	while (collection.length) {
		const point = collection.take()
		let [x, y] = point

		console.log(`移动到 x: ${x}, y: ${y}，已经移动 ${hasMove++} 步`)
		await sleep(1).then(() => draw(y * 100 + x, POINT))

		if (x === end[0] && y === end[1]) {
			draw(start[1] * 100 + start[0], START_POINT)
			await drawPath(start, x, y)
			draw(end[1] * 100 + end[0], END_POINT)
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
		collection.insert([x, y])
	}
}

async function drawPath(start, x, y) {
	let moved = 0
	while (!(x === start[0] && y === start[1])) {
		await sleep(1).then(() => draw(y * 100 + x, PATH))
		;[x, y] = cells[y * 100 + x]
		moved++
	}

	console.log(`移动 ${moved} 步即可到达终点`)
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
	for (let y = 0; y < 100; y++) {
		for (let x = 0; x < 100; x++) {
			const cell = document.createElement('div')
			cells[y * 100 + x] && (cell.style.backgroundColor = 'black')
			cell.classList.add('cell')
			cell.addEventListener('mousemove', e => {
				if (down) {
					tip.style.display = 'none'
					if (clear) {
						cells[y * 100 + x] = 0
						cell.style.backgroundColor = ''
					} else {
						cells[y * 100 + x] = 1
						cell.style.backgroundColor = 'black'
					}
				} else {
					tip.style.display = 'block'
					tip.style.left = e.pageX + 'px'
					tip.style.top = e.pageY + 'px'
					tip.textContent = `[${x}, ${y}] ${
						cells[y * 100 + x] === 1 ? '有值' : '无值'
					}`
				}
			})
			frag.append(cell)
		}
	}
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
