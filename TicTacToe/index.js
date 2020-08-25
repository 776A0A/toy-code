const _ = id => document.getElementById(id)

const pattern = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]
]

const board = _('board')
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
		const cell = e.target
		if (cell.textContent) return
		const [i, j] = cell.dataset.position.split('-')
		pattern[i][j] = (index % 2) + 1
		cell.textContent = statusMap[index++ % 2]
		console.table(pattern)
	})
}

render(board, pattern)
bindClick(board)
