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
		if (judge()) {
			result.textContent = `胜者为 ${statusMap[index % 2]}`
			done = true
		}
		cell.textContent = statusMap[index++ % 2]
	})
}

function judge() {
	console.table(pattern)
	for (let i = 0; i < pattern.length; i++) {
		const line = pattern[i]
		for (let j = 0; j < line.length; j++) {
			if (
				line[j + 1] &&
				line[j] === line[j + 1] &&
				line[j + 1] === line[j + 2]
			) {
				return true
			} else if (
				i === 0 &&
				pattern[i][j] &&
				pattern[i][j] === pattern[i + 1][j] &&
				pattern[i + 1][j] === pattern[i + 2][j]
			) {
				return true
			} else if (
				i === 0 &&
				pattern[i][0] &&
				pattern[i][0] === pattern[i + 1][1] &&
				pattern[i + 1][1] === pattern[i + 2][2]
			) {
				return true
			} else if (
				i === 2 &&
				pattern[i][0] &&
				pattern[i][0] === pattern[i - 1][1] &&
				pattern[i - 1][1] === pattern[i - 2][2]
			) {
				return true
			}
		}
	}
}

render(board, pattern)
bindClick(board)
