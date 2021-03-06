const assert = require('assert')
const parseHTML = require('../parser/html-parser/html-parser')

describe('parseHTML', () => {
	describe('doctype', () => {
		it('parse doctype with error: incorrectly-opened-comment', () => {
			try {
				parseHTML('<! DOCTYPE html>')
			} catch (error) {
				assert.equal(error.message, 'incorrectly-opened-comment')
			}
		})
		it('parse doctype', () => {
			try {
				parseHTML('<! DOCTYPE html>')
			} catch (error) {
				assert.equal(error.message, 'incorrectly-opened-comment')
			}
			const doctype = parseHTML('<!DOCTYPE html>').children[0]
			assert.equal(doctype.tagName, 'doctype')
			assert.equal(doctype.type, 'doctype')
			assert.equal(doctype.value, 'html')
		})
	})
	describe('element', () => {
		it('parse a div', () => {
			const div = parseHTML('<div></div>').children[0]
			assert.equal(div.tagName, 'div')
			assert.equal(div.children.length, 0)
			assert.equal(div.type, 'element')
		})
		it('parse an unmatched tag, should throw an error', () => {
			try {
				parseHTML('<div><span></div>')
			} catch (error) {
				assert.equal(error.message, "tag start end doesn't match")
			}
		})
		it("invalid token '=' in tagOpen", () => {
			try {
				parseHTML('<div =></div>')
			} catch (error) {
				assert.equal(error.message, "invalid token '=' in tagOpen")
			}
		})
		it('no end tag name', () => {
			try {
				parseHTML('<div></>')
			} catch (error) {
				assert.equal(error.message, 'no end tag name')
			}
		})
		it('unexpected token in end tag', () => {
			try {
				parseHTML('<div></->')
			} catch (error) {
				assert.equal(error.message, 'unexpected token: -')
			}
		})
		describe('self-closing', () => {
			it('self closing tag', () => {
				const input = parseHTML('<input />').children[0]
				assert.equal(input.tagName, 'input')
				assert.equal(input.children.length, 0)
				assert.equal(input.type, 'element')
			})
			it('selfClosing-tag with no >', () => {
				try {
					parseHTML('<input /')
				} catch (error) {
					assert.equal(error.message, 'selfClosing-tag with no >')
				}
			})
		})
		describe('attribute', () => {
			it('parse a div with attributes', () => {
				const div = parseHTML('<div id="a"></div>').children[0]
				const attr = div.attributes[0]
				assert.equal(attr.name, 'id')
				assert.equal(attr.value, 'a')
			})
			it('with a no value attribute', () => {
				const div = parseHTML('<div id="a" checked></div>').children[0]
				const attr = div.attributes[1]
				assert.equal(attr.name, 'checked')
				assert.equal(attr.value, true)
			})
			it('with single quote attribute vlaue', () => {
				const div = parseHTML("<div class='b'></div>").children[0]
				const attr = div.attributes[0]
				assert.equal(attr.name, 'class')
				assert.equal(attr.value, 'b')
			})
			it('with = but no attribute value', () => {
				try {
					parseHTML('<div class=></div>')
				} catch (error) {
					assert.equal(error.message, "unexpected token '>' after =")
				}
			})
			it('unquoted attribute value', () => {
				const div = parseHTML('<div class=b></div>').children[0]
				const attr = div.attributes[0]
				assert.equal(attr.name, 'class')
				assert.equal(attr.value, 'b')
			})
			it('missing whitespace between attributes', () => {
				try {
					parseHTML('<div class="b"id="a"></div>')
				} catch (error) {
					assert.equal(error.message, 'missing-whitespace-between-attributes')
				}
			})
		})
	})
	describe('text content', () => {
		it('parse a div with text', () => {
			const div = parseHTML('<div>Hello</div>').children[0]
			const text = div.children[0].content
			assert.equal(text, 'Hello')
		})
		it('text content includes a < sign', () => {
			const div = parseHTML('<div>a < b</div>').children[0]
			const text = div.children[0].content
			assert.equal(text, 'a < b')
		})
	})
})
