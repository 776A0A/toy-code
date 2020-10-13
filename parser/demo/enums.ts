export const enum DfaState {
	Initial,
	Id,
	IntConstant,
	GT,
	GE /* greater than & equal */
}

export enum TokenType {
	Identifier = 'Identifier',
	IntConstant = 'IntConstant',
	RelOp = 'RelOp'
}
