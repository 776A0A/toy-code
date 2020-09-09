const EOF = Symbol('EOF')
const lettersRx = /^[a-zA-Z]$/
const spaceRx = /^[\t\n\f ]$/

let currentToken = null
let currentAttribute = null
let currentTextNode = null

let stack = []

function parseHTML(html) {
	stack = [
		{
			type: 'document',
			children: []
		}
	]
	let state = data
	for (const s of html) {
		state = state(s)
	}
	state = state(EOF)
	return stack[0]
}

function emit(token) {
	const top = stack[stack.length - 1]
	if (token.type === 'startTag') {
		const element = {
			type: 'element',
			children: [],
			attributes: []
		}
		element.tagName = token.tagName
		for (const t in token) {
			if (token.hasOwnProperty(t)) {
				if (t !== 'type' && t !== 'tagName') {
					element.attributes.push({
						name: t,
						value: token[t]
					})
				}
			}
		}

		top.children.push(element)
		element.parent = top

		// 自封闭标签入栈后马上出栈，所以不用处理
		if (!token.isSelfClosing) {
			stack.push(element) // 把startTag暂时存放在这里，在emit endTag时会拿出
		}
		currentTextNode = null
	} else if (token.type === 'endTag') {
		if (top.tagName !== token.tagName) {
			throw new Error("tag start end doesn't match")
		} else {
			stack.pop()
		}
		currentTextNode = null
	} else if (token.type === 'text') {
		if (currentTextNode == null) {
			currentTextNode = {
				type: 'text',
				content: ''
			}
			top.children.push(currentTextNode)
		}
		currentTextNode.content += token.content
	}
}

function data(s) {
	// 这里有三种情况，开始；结束；自封闭标签
	if (s === '<') return tagOpen
	else if (s === EOF) {
		emit({ type: 'EOF' })
		return
	} else {
		emit({
			type: 'text',
			content: s
		})
		return data
	}
}

function tagOpen(s) {
	if (s === '/') return endTagOpen
	else if (lettersRx.test(s)) {
		currentToken = {
			type: 'startTag',
			tagName: ''
		}
		return tagName(s)
	} else {
		// 文本中包含<符号，那么也就是说前一个是<符号，才会进入tagOpen阶段
		// 所以这里要emit两个
		emit({
			type: 'text',
			content: '<'
		})
		emit({
			type: 'text',
			content: s
		})
		return data
	}
}

function endTagOpen(s) {
	if (lettersRx.test(s)) {
		currentToken = {
			type: 'endTag',
			tagName: ''
		}
		return tagName(s)
	} else if (s === '>') {
		throw Error('no end tag name')
	} else if (s === EOF) {
		throw Error('unexpected token: ' + s)
	} else throw Error('unexpected token: ' + s)
}

function tagName(s) {
	// 接收到了空格，那么就进入等待属性状态
	if (spaceRx.test(s)) return beforeAttributeName
	// 自封闭标签
	else if (s === '/') return selfClosingStartTag
	// 回到起始状态
	else if (s === '>') {
		emit(currentToken)
		return data
	} else if (lettersRx.test(s)) {
		currentToken.tagName += s.toLowerCase() // 所以html不缺分大小写
		return tagName
	} else {
		throw Error(`unexpected token: ${s}`)
	}
}

function beforeAttributeName(s) {
	// 多个空格
	if (spaceRx.test(s)) return beforeAttributeName
	else if (s === '>' || s === '/' || s === EOF) return afterAttributeName(s)
	else if (s === '=') {
		throw Error("invalid token '=' in tagOpen")
	} else {
		currentAttribute = {
			name: '',
			value: ''
		}
		return attributeName(s)
	}
}
function selfClosingStartTag(s) {
	if (s === '>') {
		currentToken.isSelfClosing = true
		emit(currentToken)
		return data
	} else if (s === EOF) throw Error('selfClosing-tag with no >')
	else throw Error('selfClosing-tag with no >')
}

function afterAttributeName(s) {
	// 这种情况就是值为true或false的属性
	if (spaceRx.test(s)) return afterAttributeName
	else if (s === '/') return selfClosingStartTag
	else if (s === '=') return beforeAttributeValue
	// 类似于checked这种属性，没有=和value，只需要一个key就ok
	else if (s === '>') {
		currentToken[currentAttribute.name] = currentAttribute.value
		emit(currentToken)
		return data
	} else if (s === EOF) throw Error(`unexpected token: ${s.toString()}`)
	else {
		currentToken = {
			type: 'attributeName'
		}
		return attributeName(s)
	}
}

function attributeName(s) {
	// 类似于checked这种属性，没有=和value，只需要一个key就ok
	if (spaceRx.test(s) || s === '/' || s === '>' || s === EOF) {
		currentAttribute.value = true
		return afterAttributeName(s)
	} else if (s === '=') return beforeAttributeValue
	else if (s === '<' || s === '"' || s === "'") throw Error()
	else {
		currentAttribute.name += s
		return attributeName
	}
}

function doubleQuoteAttributeValue(s) {
	if (s === '"') {
		currentToken[currentAttribute.name] = currentAttribute.value
		return afterQuotedAttributeValue
	} else if (s === '\u0000' || s === EOF) {
	} else {
		currentAttribute.value += s
		return doubleQuoteAttributeValue
	}
}

function singleQuoteAttributeValue(s) {
	if (s === "'") {
		currentToken[currentAttribute.name] = currentAttribute.value
		return afterQuotedAttributeValue
	} else if (s === '\u0000' || s === EOF) {
	} else {
		currentAttribute.value += s
		return singleQuoteAttributeValue
	}
}

function afterQuotedAttributeValue(s) {
	if (spaceRx.test(s)) return beforeAttributeName
	else if (s === '/') return selfClosingStartTag
	else if (s === '>') {
		currentToken[currentAttribute.name] = currentAttribute.value
		emit(currentToken)
		return data
	} else if (s === EOF) {
	} else {
		throw Error('missing-whitespace-between-attributes parse error')
		// return beforeAttributeName(s)
	}
}

function unquotedAttributeValue(s) {
	if (spaceRx.test(s)) {
		currentToken[currentAttribute.name] = currentAttribute.value
		return beforeAttributeName
	} else if (s === '>') {
		currentToken[currentAttribute.name] = currentAttribute.value
		emit(currentToken)
		return data
	} else if (
		s === '"' ||
		s === "'" ||
		s === '<' ||
		s === '=' ||
		s === '`' ||
		s === EOF
	) {
	}
	// 即使遇到了/也会解析为value
	else {
		currentAttribute.value += s
		return unquotedAttributeValue
	}
}

function beforeAttributeValue(s) {
	/**
	 * =等号后面可以有空格?? 标准里这里会处理为转到beforeAttributeName状态，
	 * 但实际实验的时候是会转换为value的，即使是/也会成为value的一部分，直到遇到下一个空格
	 */
	if (spaceRx.test(s)) return beforeAttributeName
	else if (s === '"') return doubleQuoteAttributeValue
	else if (s === "'") return singleQuoteAttributeValue
	else if (s === '>') throw Error("unexpected token '>' after =")
	else return unquotedAttributeValue(s)
}

// parseHTML('<input />')

module.exports = {
	stack,
	parseHTML
}
