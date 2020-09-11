const { stack } = require('./shared')
const currentToken = require('./token')

module.exports = function emit(token) {
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
		currentToken.currentTextNode = null
	} else if (token.type === 'endTag') {
		if (top.tagName !== token.tagName) {
			throw new TypeError("tag start end doesn't match")
		} else {
			stack.pop()
		}
		currentToken.currentTextNode = null
	} else if (token.type === 'text') {
		if (currentToken.currentTextNode == null) {
			currentToken.currentTextNode = {
				type: 'text',
				content: ''
			}
			top.children.push(currentToken.currentTextNode)
		}
		currentToken.currentTextNode.content += token.content
	} else if (token.type === 'doctype') {
		token.tagName = 'doctype'
		top.children.push(token)
		token.parent = top
	}
}
