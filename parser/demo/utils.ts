export function isAlpha(s: any): s is string {
	return typeof s === 'string'
}

export function isDigit(s: any): s is number {
	return typeof s === 'number'
}
