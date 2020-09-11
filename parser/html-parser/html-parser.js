const {
	EOF,
	lettersRegExp,
	spaceRegExp,
	numberRegExp,
	stack
} = require('./shared')
const token = require('./token')

const emit = require('./emitter')

function parseHTML(html) {
	stack.push({
		type: 'document',
		children: []
	})
	let state = data
	for (const s of html) {
		state = state(s)
	}
	state = state(EOF)
	return stack.pop()
}

function data(s) {
	// 这里有三种情况，开始；结束；自封闭标签
	if (s === '<') return tagOpen
	// else if (s === '&') {
	// 	return characterReference(s)
	// }
	else if (s === EOF) {
		emit({ type: 'EOF' })
		return
	} else if (/\r\n/.test(s)) return data
	else {
		emit({
			type: 'text',
			content: s
		})
		return data
	}
}

function DOCTYPE(s) {
	if (spaceRegExp.test(s)) return beforeDOCTYPEName
	else if (s === '>') {
		return beforeDOCTYPEName(s)
	} else if (s === EOF) {
		throw TypeError('eof-in-doctype')
	} else {
		throw TypeError(`missing-whitespace-before-doctype-name`)
	}
}

function beforeDOCTYPEName(s) {
	if (spaceRegExp.test(s)) return beforeDOCTYPEName
	else if (/[A-Z]/.test(s)) {
		token.currentDOCTYPEToken = {
			type: 'doctype',
			value: s.toLowerCase()
		}
		return DOCTYPEName
	} else if (s === '>') {
		throw TypeError(`missing-doctype-name`)
	} else if (s === EOF) {
		throw TypeError(`eof-in-doctype`)
	} else {
		token.currentDOCTYPEToken = {
			type: 'doctype',
			value: s.toLowerCase()
		}
		return DOCTYPEName
	}
}

function DOCTYPEName(s) {
	if (spaceRegExp.test(s)) return afterDOCTYPEName
	else if (s === '>') {
		emit(token.currentDOCTYPEToken)
		return data
	} else if (/[A-Z]/.test(s)) {
		token.currentDOCTYPEToken.value += s
		return DOCTYPEName
	} else if (s === EOF) {
		throw TypeError(`eof-in-doctype`)
	} else {
		token.currentDOCTYPEToken.value += s
		return DOCTYPEName
	}
}

function afterDOCTYPEName(s) {
	if (spaceRegExp.test(s)) return afterDOCTYPEName
	else if (s === '>') {
		emit(token.currentDOCTYPEToken)
		return data
	} else if (s === EOF) {
		throw TypeError(`eof-in-doctype`)
	} else {
		throw TypeError(`unexpected token: ${s}`)
	}
}

// function characterReference(s) {
// 	if(s === '&') {
// 		temporaryBuffer = s
// 		return characterReference
// 	} else if(lettersRegExp.test(s) || numberRegExp.test(s)) {
// 		return namedCharacterReference(s)
// 	} else if (s === '#') {
// 		temporaryBuffer += s
// 		return numericCharacterReference
// 	} else {
// 		return data
// 	}
// }

// function namedCharacterReference(s) {

// }

// function numericCharacterReference(s){

// }

function tagOpen(s) {
	// <!
	if (s === '!') return markupDeclarationOpen
	else if (s === '/') return endTagOpen
	else if (lettersRegExp.test(s)) {
		token.currentToken = {
			type: 'startTag',
			tagName: ''
		}
		return tagName(s)
	} else if (s === EOF) {
		throw TypeError('eof-before-tag-name')
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

// <!
function markupDeclarationOpen(s) {
	if (s === '-') {
		token.currentComment = {
			type: 'comment',
			content: ''
		}
		return comment
	} else if (s.toLowerCase() === 'd') {
		return doctypeO
	} else {
		throw TypeError('incorrectly-opened-comment')
	}
}
function doctypeO(s) {
	if (s.toLowerCase() === 'o') return doctypeC
	else {
		throw TypeError(`unexpected token: ${s} in doctypeO`)
	}
}
function doctypeC(s) {
	if (s.toLowerCase() === 'c') return doctypeT
	else {
		throw TypeError(`unexpected token: ${s} in doctypeC`)
	}
}
function doctypeT(s) {
	if (s.toLowerCase() === 't') return doctypeY
	else {
		throw TypeError(`unexpected token: ${s} in doctypeT`)
	}
}
function doctypeY(s) {
	if (s.toLowerCase() === 'y') return doctypeP
	else {
		throw TypeError(`unexpected token: ${s} in doctypeY`)
	}
}
function doctypeP(s) {
	if (s.toLowerCase() === 'p') return doctypeE
	else {
		throw TypeError(`unexpected token: ${s} in doctypeP`)
	}
}
function doctypeE(s) {
	if (s.toLowerCase() === 'e') return DOCTYPE
	else {
		throw TypeError(`unexpected token: ${s} in doctypeE`)
	}
}

function comment(s) {}

function endTagOpen(s) {
	if (lettersRegExp.test(s)) {
		token.currentToken = {
			type: 'endTag',
			tagName: ''
		}
		return tagName(s)
	} else if (s === '>') {
		throw TypeError('no end tag name')
	} else if (s === EOF) {
		throw TypeError('unexpected token: ' + s)
	} else throw TypeError('unexpected token: ' + s)
}

function tagName(s) {
	// 接收到了空格，那么就进入等待属性状态
	if (spaceRegExp.test(s)) return beforeAttributeName
	// 自封闭标签
	else if (s === '/') return selfClosingStartTag
	// 回到起始状态
	else if (s === '>') {
		emit(token.currentToken)
		return data
	} else if (lettersRegExp.test(s)) {
		token.currentToken.tagName += s.toLowerCase() // 所以html不缺分大小写
		return tagName
	} else {
		throw TypeError(`unexpected token: ${s}`)
	}
}

function beforeAttributeName(s) {
	// 多个空格
	if (spaceRegExp.test(s)) return beforeAttributeName
	else if (s === '>' || s === '/' || s === EOF) return afterAttributeName(s)
	else if (s === '=') {
		throw TypeError("invalid token '=' in tagOpen")
	} else {
		token.currentAttribute = {
			name: '',
			value: ''
		}
		return attributeName(s)
	}
}
function selfClosingStartTag(s) {
	if (s === '>') {
		token.currentToken.isSelfClosing = true
		emit(token.currentToken)
		return data
	} else if (s === EOF) throw TypeError('selfClosing-tag with no >')
	else throw TypeError('selfClosing-tag with no >')
}

function afterAttributeName(s) {
	// 这种情况就是值为true或false的属性
	if (spaceRegExp.test(s)) return afterAttributeName
	else if (s === '/') return selfClosingStartTag
	else if (s === '=') return beforeAttributeValue
	// 类似于checked这种属性，没有=和value，只需要一个key就ok
	else if (s === '>') {
		token.currentToken[token.currentAttribute.name] =
			token.currentAttribute.value
		emit(token.currentToken)
		return data
	} else if (s === EOF) throw TypeError(`unexpected token: ${s.toString()}`)
	else {
		token.currentToken = {
			type: 'attributeName'
		}
		return attributeName(s)
	}
}

function attributeName(s) {
	// 类似于checked这种属性，没有=和value，只需要一个key就ok
	if (spaceRegExp.test(s) || s === '/' || s === '>' || s === EOF) {
		token.currentAttribute.value = true
		return afterAttributeName(s)
	} else if (s === '=') return beforeAttributeValue
	else if (s === '<' || s === '"' || s === "'") throw TypeError()
	else {
		token.currentAttribute.name += s
		return attributeName
	}
}

function doubleQuoteAttributeValue(s) {
	if (s === '"') {
		token.currentToken[token.currentAttribute.name] =
			token.currentAttribute.value
		return afterQuotedAttributeValue
	} else if (s === '\u0000' || s === EOF) {
	} else {
		token.currentAttribute.value += s
		return doubleQuoteAttributeValue
	}
}

function singleQuoteAttributeValue(s) {
	if (s === "'") {
		token.currentToken[token.currentAttribute.name] =
			token.currentAttribute.value
		return afterQuotedAttributeValue
	} else if (s === '\u0000' || s === EOF) {
	} else {
		token.currentAttribute.value += s
		return singleQuoteAttributeValue
	}
}

function afterQuotedAttributeValue(s) {
	if (spaceRegExp.test(s)) return beforeAttributeName
	else if (s === '/') return selfClosingStartTag
	else if (s === '>') {
		token.currentToken[token.currentAttribute.name] =
			token.currentAttribute.value
		emit(token.currentToken)
		return data
	} else if (s === EOF) {
	} else {
		throw TypeError('missing-whitespace-between-attributes')
		// return beforeAttributeName(s)
	}
}

function unquotedAttributeValue(s) {
	if (spaceRegExp.test(s)) {
		token.currentToken[token.currentAttribute.name] =
			token.currentAttribute.value
		return beforeAttributeName
	} else if (s === '>') {
		token.currentToken[token.currentAttribute.name] =
			token.currentAttribute.value
		emit(token.currentToken)
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
		token.currentAttribute.value += s
		return unquotedAttributeValue
	}
}

function beforeAttributeValue(s) {
	/**
	 * =等号后面可以有空格?? 标准里这里会处理为转到beforeAttributeName状态，
	 * 但实际实验的时候是会转换为value的，即使是/也会成为value的一部分，直到遇到下一个空格
	 */
	if (spaceRegExp.test(s)) return beforeAttributeName
	else if (s === '"') return doubleQuoteAttributeValue
	else if (s === "'") return singleQuoteAttributeValue
	else if (s === '>') throw TypeError("unexpected token '>' after =")
	else return unquotedAttributeValue(s)
}

module.exports = parseHTML
