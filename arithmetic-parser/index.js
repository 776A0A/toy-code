const regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\+)|(\-)|(\*)|(\/)|(\=)/g
const dictionary = [
	'Number',
	'Whitespace',
	'LineTerminator',
	'+',
	'-',
	'*',
	'/',
	'='
]

function* tokenize(source) {
	let result = null
	do {
		result = regexp.exec(source)
		if (!result) break
		const token = {
			type: null,
			value: null
		}
		for (let i = 0; i < dictionary.length; i++) {
			result[i + 1] && (token.type = dictionary[i])
		}
		token.value = result[0]
		yield token
	} while (result)
}

function run() {
	for (const token of tokenize('1 + 1 * 2 - 19 / 12')) {
		console.log(token)
	}
}
