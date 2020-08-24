const hash = () => Math.random().toString(36).slice(2)
const downloadButton = document.getElementById('download-button')

fetch(
	// 'https://gw.alipayobjects.com/os/antvdemo/assets/data/algorithm-category.json'
	'./elementDefinations.json'
)
	.then(res => res.json())
	.then(data => {
		generateCategory(data.children, (data.children = []))
		const width = document.getElementById('data-container').scrollWidth
		const height = 10000
		const graph = new G6.TreeGraph({
			container: 'data-container',
			width,
			height,
			renderer: 'svg',
			modes: {
				default: [
					{
						type: 'collapse-expand',
						onChange: function onChange(item, collapsed) {
							const data = item.get('model').data
							data.collapsed = collapsed
							return true
						}
					},
					'drag-canvas',
					'zoom-canvas'
				]
			},
			defaultNode: {
				type: 'circle',
				size: 26,
				anchorPoints: [
					[0, 0.5],
					[1, 0.5]
				],
				style: {
					fill: '#C6E5FF',
					stroke: '#5B8FF9'
				}
			},
			defaultEdge: {
				type: 'cubic-horizontal',
				style: {
					stroke: '#A3B1BF'
				}
			},
			layout: {
				type: 'dendrogram',
				direction: 'LR', // H / V / LR / RL / TB / BT
				nodeSep: 30,
				rankSep: 100
			}
		})

		graph.node(function (node) {
			return {
				label: node.label,
				labelCfg: {
					position:
						node.children && node.children.length > 0 ? 'left' : 'right',
					offset: 5
				}
			}
		})

		graph.data(data)
		graph.render()
		graph.fitView()

		downloadButton.addEventListener('click', e => {
			graph.downloadFullImage('html-spec', {
				backgroundColor: '#fff',
				padding: [30, 15, 15, 15]
			})
		})
	})

function generateCategory(elements, children) {
	elements.forEach(elem => {
		elem.categories.forEach(category => {
			const child = children.find(({ id }) => id === category)
			if (child) {
				child.children.push({
					id: `${hash()}`,
					label: elem.name
				})
			} else {
				children.push({
					id: category,
					label: category,
					children: [{ id: `${hash()}`, label: elem.name }]
				})
			}
		})
	})
}
