const map = document.getElementById('map')
const save = document.getElementById('save')
const reset = document.getElementById('reset')
let down, clear
let cells = localStorage.map
	? JSON.parse(localStorage.map)
	: Array(10000).fill(0)

async function findPath(map, start, end) {
	const queue = [start]
	map.children[end[1] * 100 + end[0]].style.backgroundColor = 'lightcoral'
	while (queue.length) {
		const [x, y] = queue.shift()
		if (x === end[0] && y === end[1]) {
			map.children[end[1] * 100 + end[0]].style.backgroundColor = 'lightcoral'
			return true
		}
		await insert([x - 1, y])
		await insert([x + 1, y])
		await insert([x, y - 1])
		await insert([x, y + 1])
	}

	return false

	async function insert([x, y]) {
		if (cells[y * 100 + x]) return
		if (x < 0 || x >= 100 || y < 0 || y >= 100) return
		await sleep(1)
		map.children[y * 100 + x].style.backgroundColor = 'lightseagreen'
		cells[y * 100 + x] = 2
		queue.push([x, y])
	}
}

function sleep(t) {
	return new Promise(resolve => setTimeout(resolve, t))
}

function render() {
	map.innerHTML = ''
	const frag = document.createDocumentFragment()
	cells.forEach((item, i) => {
		const cell = document.createElement('div')
		if (item) {
			cell.style.backgroundColor = 'black'
		}
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
