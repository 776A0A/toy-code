const regexp = /([\d\.]+)|([ \t]+)|([\r\n]+)|(\+)|(\-)|(\*)|(\/)|(\=)/g
const dictionary = [
	'Number',
	'Whitespace',
	'LineTerminator',
	'+',
	'-',
	'*',
	'/',
	'='
]

function* tokenize(source) {
	let result = null
	let lastIndex = 0
	do {
		lastIndex = regexp.lastIndex
		result = regexp.exec(source)
		if (!result) break
		// 当有非法字符的时候，lastIndex跳过的长度会超过实际找到的合法字符长度
		if (regexp.lastIndex - lastIndex > result[0].length)
			throw new Error(
				`Unexpected token: "${source.slice(lastIndex, lastIndex + 1)}"`
			)
		const token = {
			type: null,
			value: null
		}
		for (let i = 0; i < dictionary.length; i++) {
			result[i + 1] && (token.type = dictionary[i])
		}
		token.value = result[0]
		yield token
	} while (result)

	yield { type: 'EOF' }
}

const source = []

for (const token of tokenize('1 * 2 / 12 + 1 - 2 + 3')) {
	if (token.type !== 'Whitespace' && token.type !== 'LineTerminator')
		source.push(token)
}

function AdditiveExpression(source) {
	if (source[0].type === 'Number') {
		MultiplicativeExpression(source)
	}
	if (source[0].type === 'MultiplicativeExpression') {
		const node = {
			type: 'AdditiveExpression',
			children: [source.shift()]
		}
		source.unshift(node)
	}
	if (
		source[0].type === 'AdditiveExpression' &&
		source.length > 1 &&
		(source[1].type === '+' || source[1].type === '-')
	) {
		const node = {
			type: 'AdditiveExpression',
			children: [source.shift(), source.shift()]
		}
		MultiplicativeExpression(source)
		node.children.push(source.shift())
		source.unshift(node)
		return AdditiveExpression(source)
	}
	if (source[0].type === 'AdditiveExpression') return source
}

function MultiplicativeExpression(source) {
	if (source[0].type === 'Number') {
		const node = {
			type: 'MultiplicativeExpression',
			children: [source.shift()]
		}
		source.unshift(node)
	}
	if (
		source[0].type === 'MultiplicativeExpression' &&
		source.length > 1 &&
		(source[1].type === '*' || source[1].type === '/')
	) {
		const node = {
			type: 'MultiplicativeExpression',
			children: [source.shift(), source.shift(), source.shift()]
		}
		source.unshift(node)
		return MultiplicativeExpression(source)
	}
	if (source[0].type === 'MultiplicativeExpression') return source
}
