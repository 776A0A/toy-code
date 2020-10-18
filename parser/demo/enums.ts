export const enum DfaState {
	Initial,
	Id,
	IntConstant,
	GT,
	GE /* greater than & equal */,
	Id_int1,
	Id_int2,
	Id_int3
}

export enum TokenType {
	Identifier = 'Identifier',
	IntConstant = 'IntConstant',
	RelOp = 'RelOp'
}
