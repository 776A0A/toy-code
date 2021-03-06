import { isAlpha, isDigit, isSpace } from './utils'
import { DfaState, TokenType } from './enums'
import { Token, Parser } from './types'

let nextState: DfaState = DfaState.Initial

let token: Token = {}
let tokenText: any[] = []
let stack: Token[] = []

function parse(str: string): Token[] {
	let state: Parser = initial
	for (const s of str) {
		state = state(s)
	}
	initToken()
	return stack
}

function initToken() {
	stack.push({ ...token, text: tokenText.join('') })
	tokenText = []
}

const initial: Parser = s => {
	if (s === '>') {
		nextState = DfaState.GT
		token.type = TokenType.RelOp
		tokenText.push(s)
		return gt
	} else if (isAlpha(s) && !isDigit(s)) {
		if (s === 'i') {
			return intI(s)
		} else {
			nextState = DfaState.Id
			token.type = TokenType.Identifier
			tokenText.push(s)
			return id
		}
	} else if (isDigit(s)) {
		nextState = DfaState.IntConstant
		token.type = TokenType.IntConstant
		tokenText.push(s)
		return id
	} else {
		nextState = DfaState.Initial
		return initial
	}
}

const intI: Parser = s => {
	nextState = DfaState.Id_int1
	return intN
}

const intN: Parser = s => {
	if (s === 'n') {
		nextState = DfaState.Id_int2
		return intT
	} else {
		return initial(s)
	}
}

const intT: Parser = s => {
	if (s === 't') {
		nextState = DfaState.Id_int3
		return afterInt
	} else {
		return initial(s)
	}
}

const afterInt: Parser = s => {
	if (isSpace(s)) {
		initToken()
		return initial
	} else {
		nextState = DfaState.Id
		token.type = TokenType.Identifier
		tokenText.push(s)
		return id
	}
}

const id: Parser = s => {
	if (isSpace(s)) {
		initToken()
		return initial
	} else if (isAlpha(s) || !isDigit(s)) {
		tokenText.push(s)
		return id
	} else {
		initToken()
		return initial
	}
}

const gt: Parser = s => {
	if (s === '=') {
		token.type = TokenType.RelOp
		tokenText.push(s)
		return ge
	} else {
		initToken()
		return initial
	}
}

const ge: Parser = s => {
	if (isSpace(s)) {
		initToken()
		return initial
	} else {
		throw TypeError('Unexpected token: ' + s)
	}
}

const intConstant: Parser = s => {
	if (isDigit(s)) {
		tokenText.push(s)
		return intConstant
	} else {
		initToken()
		return initial
	}
}

const s1: string = `age >= 45`

console.log(parse(s1))
