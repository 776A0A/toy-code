const board = document.getElementById('board')
let down, clear

function render() {
	const cells = Array(10000).fill(0)
	const frag = document.createDocumentFragment()
	cells.forEach((item, i) => {
		const cell = document.createElement('div')
		cell.classList.add('cell')
		cell.addEventListener('mousemove', e => {
			if (down) {
				if (clear) {
					cell.style.backgroundColor = ''
				} else {
					cell.style.backgroundColor = 'black'
				}
			}
		})
		frag.append(cell)
	})
	board.append(frag)
}

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
