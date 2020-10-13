export function isAlpha(s: any): s is string {
	return typeof s === 'string'
}

export function isDigit(s: any): s is number {
	return !!Number(s) && typeof Number(s) === 'number'
}

type Spaces = ' '

export function isSpace(s: any): s is Spaces {
	return /\s+/.test(s)
}
