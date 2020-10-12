import { isAlpha, isDigit } from './utils'
import { DfaState, TokenType } from './enums'
import { Token } from './types'

let nextState: DfaState = DfaState.Initial

let token: Token = {}
let tokenText: string[] = []

function parse(s: string): void {
	if (isAlpha(s)) {
		nextState = DfaState.Id
		token.type = TokenType.Identifier
		tokenText.push(s)
	} else if (isDigit(s)) {
		nextState = DfaState.IntConstant
		token.type = TokenType.IntConstant
		tokenText.push(s)
	} else if (s === '>') {
		nextState = DfaState.GT
		token.type = TokenType.RelOp
		tokenText.push(s)
	} else {
		nextState = DfaState.Initial
	}
}

const s1: string = `age >= 45`
