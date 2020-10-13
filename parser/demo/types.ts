import { TokenType } from './enums'

export interface Token {
	type?: TokenType
	text?: string
}

export type Parser = (s: string | number) => Parser
