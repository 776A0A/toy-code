const _ = id => document.getElementById(id)

const pattern = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]
]

const board = _('board')
const result = _('result')
let done = false
const statusMap = ['⭕', '❌']
let index = 0

function render(elem, content) {
	const cell = `<div class="cell" data-position="__p__">__content__</div>`
	elem.innerHTML = content.reduce(
		(lineHtml, line, i) =>
			lineHtml +
			line.reduce(
				(cellHtml, status, j) =>
					cellHtml +
					cell
						.replace(
							'__content__',
							status === 2 ? '❌' : status === 1 ? '⭕' : ''
						)
						.replace('__p__', i + '-' + j),
				''
			),
		''
	)
}

function bindClick(elem) {
	elem.addEventListener('click', e => {
		if (done) return
		const cell = e.target
		if (cell.textContent) return
		const [i, j] = cell.dataset.position.split('-')
		pattern[i][j] = (index % 2) + 1
		if (judge(pattern[i][j], i, j)) {
			result.textContent = `胜者为 ${statusMap[index % 2]}`
			done = true
		}
		cell.textContent = statusMap[index++ % 2]
	})
}

function judge(cellVal, x, y) {
	{
		let win = true
		for (let j = 0; j < 3; j++) {
			if (pattern[x][j] !== cellVal) {
				win = false
				break
			}
		}
		if (win) return true
	}
	{
		let win = true
		for (let j = 0; j < 3; j++) {
			if (pattern[j][y] !== cellVal) {
				win = false
				break
			}
		}
		if (win) return true
	}
	{
		let win = true
		for (let j = 0; j < 3; j++) {
			if (pattern[j][j] !== cellVal) {
				win = false
				break
			}
		}
		if (win) return true
	}
	{
		let win = true
		for (let j = 0; j < 3; j++) {
			if (pattern[j][2 - j] !== cellVal) {
				win = false
				break
			}
		}
		if (win) return true
	}
}

render(board, pattern)
bindClick(board)
