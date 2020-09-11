const EOF = Symbol('EOF')
const lettersRegExp = /^[a-zA-Z]$/
const spaceRegExp = /^[\t\n\f ]$/
const numberRegExp = /\d/

const stack = []

module.exports = {
	EOF,
	lettersRegExp,
	spaceRegExp,
	numberRegExp,
	stack
}
